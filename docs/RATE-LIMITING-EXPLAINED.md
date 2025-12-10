# Rate Limiting: Simple Explanation & What We Fixed

## 🤔 What is Rate Limiting?

**Simple answer:** It's like a bouncer at a club - limits how many times someone can do something in a time period.

**Example:**

- You allow 5 login attempts per 15 minutes
- If someone tries 6 times → They get blocked for 15 minutes

**Why?** Prevents:

- Brute force attacks (guessing passwords)
- Spam (sending 1000 verification emails)
- DDoS attacks (overwhelming your server)

---

## 🚨 THE PROBLEMS WE HAD

### **Problem #1: Everyone Shared the Same Rate Limit**

#### What was happening:

```
User A (Alice) tries to login 3 times  ✅
User B (Bob) tries to login 2 times    ✅
User C (Charlie) tries to login once   ❌ BLOCKED!
```

**Why?** All users appeared to come from the same IP address.

#### How it happened:

**Scenario A: No Trust Proxy**

```
Real Flow:
Browser (203.45.67.89) → AWS ELB → Your Server

What server sees:
req.ip = "10.0.0.5" (ELB's internal IP)
```

**Everyone has same IP = share same limit!**

**Scenario B: Wrong Trust Proxy Setting**

```javascript
app.set("trust proxy", true); // ❌ BAD!

// This trusts ANYONE to set X-Forwarded-For
// Attacker can fake their IP easily
```

#### Real-world impact:

- 🏢 All UiTM students on campus WiFi = blocked together
- 🏠 Family members on same home network = blocked together
- 💔 One person hitting limit = everyone suffers

---

### **Problem #2: Trust Proxy Was Too Permissive**

#### What was happening:

```javascript
// Your old code
app.set("trust proxy", true);
```

express-rate-limit saw this and said:

> ⚠️ "ERROR: This is INSECURE! Anyone can bypass rate limiting!"

#### Why it's dangerous:

**Attacker's perspective:**

```bash
# Without header
curl /api/auth/login → IP: 203.45.67.89 (real IP)

# With fake header
curl -H "X-Forwarded-For: 1.1.1.1" /api/auth/login
→ IP: 1.1.1.1 (fake IP)

# Try again with different fake IP
curl -H "X-Forwarded-For: 2.2.2.2" /api/auth/login
→ IP: 2.2.2.2 (fake IP)
```

**Result:** Infinite login attempts by changing IP each time! 🔓

---

### **Problem #3: Important Routes Had No Rate Limiting**

Routes that SHOULD be protected but weren't:

- ❌ `/api/auth/resend-verification` - Could spam verification emails
- ❌ `/api/auth/forgot-password` - Could spam password reset emails
- ❌ `/api/auth/reset-password` - Could try unlimited reset tokens

---

### **Problem #4: Rate Limiter After Body Parser**

#### What was happening:

```javascript
// Old order
app.use(express.json({ limit: "10mb" })); // 1. Parse body first
app.use("/api/", generalLimiter); // 2. Then check rate limit
```

#### Why it's bad:

**DDoS Attack Scenario:**

```javascript
// Attacker sends 1000 requests with 10MB each
for (let i = 0; i < 1000; i++) {
  fetch("/api/listings", {
    method: "POST",
    body: '{"data": "x".repeat(10 * 1024 * 1024)}', // 10MB of garbage
  });
}

// Your server:
// 1. ✅ Accepts connection
// 2. ✅ Parses 10MB body (CPU/memory usage!)
// 3. ❌ Only NOW checks rate limit
```

**Your server dies before rate limiting kicks in!** 💀

---

## ✅ THE FIXES

### **Fix #1: Proper Trust Proxy Configuration**

```javascript
// ✅ NEW CODE - Secure and working!

if (process.env.NODE_ENV === "production") {
  // Only trust the FIRST proxy (your AWS ELB)
  app.set("trust proxy", 1);
} else {
  // In dev, only trust localhost proxies
  app.set("trust proxy", "loopback");
}
```

#### How it works now:

**Production (AWS):**

```
Browser (203.45.67.89)
  → AWS ELB adds: X-Forwarded-For: 203.45.67.89
  → Your Server: "I trust the first proxy"
  → req.ip = 203.45.67.89 ✅
```

**If attacker tries to fake:**

```
Browser tries: X-Forwarded-For: 1.1.1.1
  → AWS ELB adds: X-Forwarded-For: 1.1.1.1, 203.45.67.89
  → Your Server: "I only trust FIRST value from ELB"
  → req.ip = 203.45.67.89 (real IP) ✅
```

**Result:** Each user gets their own rate limit! 🎯

---

### **Fix #2: Applied Rate Limiters to Sensitive Routes**

```javascript
// ✅ NEW CODE
const {
  emailVerificationLimit,
  passwordResetLimit,
} = require("../../middleware/auth/rateLimiter.middleware");

// Apply to routes
router.post(
  "/resend-verification",
  emailVerificationLimit,
  resendVerificationEmail
);
router.post("/forgot-password", passwordResetLimit, handleForgotPassword);
router.post("/reset-password", passwordResetLimit, handleResetPassword);
```

**Limits:**

- Email verification: 3 per 15 minutes
- Password reset: 5 per 15 minutes
- Login: 5 per 15 minutes

---

### **Fix #3: Rate Limiter BEFORE Body Parser**

```javascript
// ✅ NEW CODE - Correct order!
app.use(helmetConfig);
app.use("/api/", generalLimiter); // 1. Check rate limit FIRST
app.use("/api/auth/", authLimiter); // 2. Check auth rate limit
app.use(express.json({ limit: "10mb" })); // 3. THEN parse body
```

**Now the DDoS attack fails:**

```javascript
// Attacker sends 1000 requests
for (let i = 0; i < 1000; i++) {
  fetch("/api/listings", {
    method: "POST",
    body: hugePayload, // 10MB
  });
}

// Your server:
// 1. ✅ Accepts connection
// 2. ✅ Checks rate limit → BLOCKED after 100 requests
// 3. ❌ Never parses the body (saves CPU/memory)
```

---

### **Fix #4: Better Error Messages**

```javascript
// ❌ OLD: Generic message
{ message: "Too many requests" }

// ✅ NEW: Helpful message with retry info
{
  success: false,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
  code: "RATE_LIMIT_EXCEEDED",
  retryAfter: 900 // seconds
}
```

Plus standard headers:

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1702159200
Retry-After: 900
```

---

## 📊 SCENARIOS: Before vs After

### Scenario 1: Multiple Users on Same Network

**Before:**

```
Campus WiFi → Same public IP
Student A: 3 login attempts ✅
Student B: 2 login attempts ✅
Student C: 1 login attempt ❌ BLOCKED (limit: 5)
```

**After:**

```
Campus WiFi → Each gets tracked separately
Student A (device 1): 3 attempts ✅ (2 remaining)
Student B (device 2): 2 attempts ✅ (3 remaining)
Student C (device 3): 1 attempt ✅ (4 remaining)
```

---

### Scenario 2: Attacker Tries IP Spoofing

**Before:**

```javascript
// trust proxy: true
curl -H "X-Forwarded-For: 1.1.1.1" /login → Counted as IP 1.1.1.1 ✅
curl -H "X-Forwarded-For: 2.2.2.2" /login → Counted as IP 2.2.2.2 ✅
// Infinite attempts! 💀
```

**After:**

```javascript
// trust proxy: 1
curl -H "X-Forwarded-For: 1.1.1.1" /login
→ Server ignores fake header
→ Counted as real IP: 203.45.67.89 ✅

curl -H "X-Forwarded-For: 2.2.2.2" /login
→ Still counted as: 203.45.67.89
→ Limit reached after 5 attempts ❌
```

---

### Scenario 3: Email Spam Attack

**Before:**

```
POST /api/auth/resend-verification (no rate limit)
→ Attacker sends 1000 requests
→ 1000 emails sent 💸💸💸
```

**After:**

```
POST /api/auth/resend-verification (3 per 15min)
→ Request 1 ✅
→ Request 2 ✅
→ Request 3 ✅
→ Request 4 ❌ 429 Too Many Requests
→ Attacker blocked for 15 minutes
```

---

## 🔍 How to Test It Works

### Test 1: Different users get different counters

```bash
# User A
curl http://localhost:5000/api/listings
# Headers: RateLimit-Remaining: 999

# User B (different device)
curl http://localhost:5000/api/listings
# Headers: RateLimit-Remaining: 999 (separate counter)
```

### Test 2: Rate limit actually blocks

```bash
# Try login 6 times
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# First 5: 401 Unauthorized
# 6th: 429 Too Many Requests
```

### Test 3: Limit resets after time window

```bash
# Hit limit (5 attempts)
# Wait 15 minutes
# Try again → Works! ✅
```

---

## 🤷 Do You Need Redis?

### ❌ You DON'T need Redis if:

- Running 1 EC2 instance
- Using `pm2 start index.js` (single process)
- Server doesn't restart often

### ✅ You NEED Redis if:

- Multiple EC2 instances (scaling horizontally)
- Using `pm2 start index.js -i 4` (cluster mode)
- Want limits to survive server restarts

### Why?

```
WITHOUT Redis (current):
EC2 Instance → Memory Store → Counters in RAM

WITH Redis (future):
EC2 Instance 1 ─┐
EC2 Instance 2 ─┼→ Redis → Shared counters
EC2 Instance 3 ─┘
```

---

## 📝 Summary

| Issue               | Before               | After                     |
| ------------------- | -------------------- | ------------------------- |
| **IP Detection**    | Everyone has same IP | Each user has unique IP   |
| **Trust Proxy**     | `true` (insecure)    | `1` / `loopback` (secure) |
| **Email Spam**      | Unlimited            | 3 per 15min               |
| **Password Reset**  | Unlimited            | 5 per 15min               |
| **DDoS Protection** | Parse body first     | Block before parsing      |
| **Error Messages**  | Generic              | Helpful with retry time   |

**Result:** ✅ Secure, ✅ Per-user limits, ✅ Can't be bypassed

---

## 🎓 Key Takeaways

1. **Trust proxy matters!** Wrong setting = everyone shares limits OR easy bypass
2. **Rate limit BEFORE parsing body** = Prevents resource exhaustion
3. **Apply limiters to sensitive routes** = Email/password endpoints need protection
4. **Each IP = separate counter** = Fair for all users
5. **Redis optional for now** = Only needed when you scale to multiple servers
