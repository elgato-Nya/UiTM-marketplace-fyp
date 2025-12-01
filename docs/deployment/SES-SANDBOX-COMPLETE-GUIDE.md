# 🔧 Complete AWS SES Sandbox Setup & Troubleshooting Guide

**Issue:** Test failed with "535 Authentication Credentials Invalid"  
**Status:** SES is in Sandbox Mode (normal for new accounts)  
**Goal:** Get email working TODAY without domain verification

---

## 🚨 **IMMEDIATE FIX: Your SMTP Credentials are Wrong**

The error `535 Authentication Credentials Invalid` means your SMTP username or password is incorrect.

### 🔍 **What Happened:**

Looking at your `.env`:

```env
SMTP_USER=AKIA2HO5ELGLJUTLGA6P
SMTP_PASS=BNMSwwFGI9dOgO3H8iOZ/TJ19MGGHgwb46N8lvMTjcbU
```

**Problem:** These look like AWS Access Keys, NOT SMTP credentials!

### ⚠️ **Important Distinction:**

| Type                 | Format                | Used For                           |
| -------------------- | --------------------- | ---------------------------------- |
| **AWS Access Keys**  | Starts with `AKIA...` | AWS SDK, S3, general AWS API calls |
| **SMTP Credentials** | Different format      | Sending emails via SMTP            |

**You need SMTP credentials, not AWS Access Keys!**

---

## ✅ **SOLUTION 1: Get Correct SMTP Credentials**

### Step 1: Create SMTP Credentials in AWS Console

```powershell
# Open AWS SES SMTP Settings
Start-Process "https://console.aws.amazon.com/ses/home?region=ap-southeast-1#/smtp"
```

**Or manually:**

1. Go to AWS Console → SES → SMTP settings
2. Click **"Create SMTP Credentials"**
3. IAM User Name: `uitm-marketplace-smtp-user` (or any name)
4. Click **"Create User"**
5. **IMPORTANT:** Download or copy credentials **NOW** (you won't see them again!)

### Step 2: Update Your `.env` File

```powershell
code server\.env
```

Replace lines 23-24 with the NEW credentials:

```env
SMTP_USER=AKIXXXXXXXXXXXXXX  # New SMTP username (different from AWS keys!)
SMTP_PASS=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # New SMTP password (LONG string)
```

### Step 3: Test Again

```powershell
cd server
node scripts/test-email-connection.js
```

Should now show: ✅ Email service is working!

---

## 🏖️ **SOLUTION 2: Working with SES Sandbox (RECOMMENDED FOR NOW)**

**Good News:** You DON'T need a domain to test email features in development!

### What is SES Sandbox Mode?

| Sandbox Mode                        | Production Mode            |
| ----------------------------------- | -------------------------- |
| ✅ Free forever                     | 💰 Paid after free tier    |
| ✅ Perfect for development          | ✅ Required for real users |
| ⚠️ Can only send to verified emails | ✅ Can send to anyone      |
| ⚠️ 200 emails/day limit             | ✅ 50,000+ emails/day      |
| ✅ Available immediately            | ⏳ Requires verification   |

**For your FYP project:** Sandbox mode is **perfect** and **sufficient**!

---

## 📧 **How to Test Email Features in Sandbox Mode**

### Option A: Use Only Verified Emails (Easiest)

**Current verified email:** `afiq.sharifuzan02@gmail.com`

**Test scenario:**

1. Register with: `afiq.sharifuzan02@gmail.com`
2. Receive verification email ✅
3. Reset password for: `afiq.sharifuzan02@gmail.com`
4. Receive reset email ✅

**Limitation:** Can only test with your own email.

---

### Option B: Verify Multiple Test Emails (Better)

Add more emails for comprehensive testing:

#### 1. Your Student Email

```powershell
# Verify your UiTM student email
Start-Process "https://console.aws.amazon.com/ses/home?region=ap-southeast-1#/verified-identities"
```

Steps:

1. Click **"Create identity"**
2. Select **"Email address"**
3. Enter: `your-student-id@student.uitm.edu.my`
4. Click **"Create identity"**
5. Check your UiTM email inbox
6. Click verification link
7. Status will change to **"Verified"** ✅

#### 2. Create Gmail Aliases (Smart Trick!)

Gmail allows `+` aliases that all go to same inbox:

- `afiq.sharifuzan02+test1@gmail.com`
- `afiq.sharifuzan02+test2@gmail.com`
- `afiq.sharifuzan02+buyer@gmail.com`
- `afiq.sharifuzan02+seller@gmail.com`

**Verify each one in SES:**

```powershell
# Verify aliases
Start-Process "https://console.aws.amazon.com/ses/home?region=ap-southeast-1#/verified-identities"
```

**Result:** You can test multiple user scenarios with one Gmail inbox! 🎉

#### 3. Use Secondary Email (Friend/Family)

Verify a friend's email temporarily:

1. Ask friend for permission
2. Add their email to SES
3. They verify it
4. You can test with their email
5. Remove after testing

---

## 🎓 **For Your FYP Project: Sandbox is Enough!**

### Why Sandbox Mode is Perfect for FYP:

✅ **Demonstration Purposes**

- Show lecturers the email feature works
- Test during presentation with verified emails
- Prove functionality without production setup

✅ **Cost-Effective**

- 100% FREE forever
- No risk of accidental charges
- Perfect for academic projects

✅ **Documentation**

- Show AWS SES console screenshots
- Explain sandbox vs production in thesis
- Demonstrate understanding of email services

✅ **Quick Setup**

- No domain needed
- No DNS configuration
- No verification wait time

### For Thesis/Report, Mention:

> "The email service is implemented using AWS SES in sandbox mode.
> In production deployment, we would request production access to
> enable sending to all users. For demonstration purposes, verified
> test emails are used to showcase the complete email workflow."

---

## 🌐 **About Domain Verification (NOT NEEDED NOW)**

You mentioned needing to verify domain first. Let's clarify:

### What You Currently Think:

❌ "I need a domain to test emails"  
❌ "I need domain verification to use SES"  
❌ "I can't proceed without a domain"

### What's Actually True:

✅ Domain is ONLY needed for production access  
✅ You can test EVERYTHING in sandbox with verified emails  
✅ Domain verification is for LATER (after FYP if needed)

### When You ACTUALLY Need a Domain:

**For Production Access (later):**

- When you want to send to ANY email
- When you have real users (post-FYP)
- When you need higher sending limits

**What it requires:**

1. Buy domain (RM 30-50/year from Namecheap, GoDaddy)
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain in SES
4. Request production access
5. Wait 24 hours for approval

**Timeline:** 1-2 days minimum

### For Your FYP (NOW):

🎯 **Skip domain verification**  
🎯 **Use sandbox mode**  
🎯 **Test with verified emails only**

---

## 🎯 **Your Complete Action Plan**

### Phase 1: Fix SMTP Credentials (15 minutes)

**Do this NOW:**

1. **Get correct SMTP credentials**

   ```powershell
   Start-Process "https://console.aws.amazon.com/ses/home?region=ap-southeast-1#/smtp"
   ```

   - Click "Create SMTP Credentials"
   - Download the credentials file
   - Save it somewhere safe!

2. **Update `.env` file**

   ```powershell
   code server\.env
   ```

   Replace SMTP_USER and SMTP_PASS with NEW credentials

3. **Test connection**
   ```powershell
   cd server
   node scripts/test-email-connection.js
   ```
   Should show: ✅ Email service is working!

---

### Phase 2: Verify Multiple Test Emails (10 minutes)

**Create test scenarios:**

1. **Your Gmail + Aliases**

   - Main: `afiq.sharifuzan02@gmail.com` ✅ (already verified)
   - Test 1: `afiq.sharifuzan02+buyer@gmail.com`
   - Test 2: `afiq.sharifuzan02+seller@gmail.com`
   - Test 3: `afiq.sharifuzan02+merchant@gmail.com`

2. **Your Student Email**

   - `2022000000@student.uitm.edu.my` (your actual student ID)

3. **Verify all in AWS SES**
   ```powershell
   Start-Process "https://console.aws.amazon.com/ses/home?region=ap-southeast-1#/verified-identities"
   ```
   For each email:
   - Click "Create identity"
   - Add email
   - Check inbox
   - Click verify link

**Result:** 5+ verified test emails! 🎉

---

### Phase 3: Test Complete Email Flows (30 minutes)

**Scenario 1: New User Registration**

```
1. Register with: afiq.sharifuzan02+buyer@gmail.com
2. Check Gmail inbox (goes to main inbox)
3. Click verification link
4. Verify success ✅
```

**Scenario 2: Password Reset**

```
1. Use: afiq.sharifuzan02+seller@gmail.com
2. Request password reset
3. Check Gmail inbox
4. Click reset link
5. Set new password ✅
```

**Scenario 3: Multiple Users**

```
1. Register 3 users with different aliases
2. Each receives verification email
3. Verify all accounts
4. Test login for each ✅
```

---

### Phase 4: Document for FYP (20 minutes)

**Take Screenshots:**

1. AWS SES verified identities list
2. Email received in inbox (with headers visible)
3. Verification success page
4. Password reset flow
5. Server logs showing emails sent

**Update Thesis/Report:**

```markdown
# Email Service Implementation

## Technology Stack

- AWS Simple Email Service (SES)
- Nodemailer for SMTP integration
- Sandbox mode for development and testing

## Current Status

- Configured in AWS SES Sandbox mode
- Verified test identities for demonstration
- Production-ready code (can upgrade to production when needed)

## Testing Methodology

- Used verified email addresses for testing
- Tested complete user flows (registration, verification, password reset)
- All email features functioning correctly

## Production Considerations

- For production deployment, would request SES production access
- Would configure custom domain (e.g., noreply@uitm-marketplace.com)
- Would implement email templates for various notifications
```

---

## 📊 **Comparison: Sandbox vs Production**

| Feature               | Sandbox (NOW)       | Production (LATER)   |
| --------------------- | ------------------- | -------------------- |
| **Setup Time**        | 5 minutes           | 1-2 days             |
| **Cost**              | FREE ✅             | ~RM 0.01/email       |
| **Sending Limit**     | 200/day             | 50,000+/day          |
| **Recipients**        | Verified only       | Anyone ✅            |
| **Domain Required**   | No ✅               | Yes                  |
| **DNS Configuration** | No ✅               | Yes (SPF, DKIM)      |
| **Good For**          | Development, FYP ✅ | Real users, Business |
| **Approval Wait**     | Instant ✅          | 24 hours             |

---

## 🎓 **For Your FYP Presentation**

### What to Show Lecturers:

**1. Live Demo:**

- Register new user (with verified email)
- Check email inbox (show received email)
- Click verification link
- Show success message
- Test password reset flow

**2. Code Review:**

- Show email service implementation
- Explain AWS SES integration
- Demonstrate error handling

**3. AWS Console:**

- Show SES configuration
- Show verified identities
- Show sending statistics

### What to Explain:

> "We implemented email verification and password reset using AWS SES.
> Currently running in sandbox mode which is appropriate for development
> and demonstration. The system is production-ready and can be upgraded
> to production mode when deployed for real users by requesting production
> access and configuring a custom domain."

---

## 🐛 **Troubleshooting Guide**

### Error: "535 Authentication Credentials Invalid"

**Cause:** Wrong SMTP credentials  
**Fix:** Create new SMTP credentials in AWS SES console

### Error: "MessageRejected: Email address is not verified"

**Cause:** Trying to send to unverified email in sandbox  
**Fix:** Verify recipient email in AWS SES console

### Error: "Connection timeout"

**Cause:** Firewall/network blocking port 587  
**Fix:**

- Try different network (mobile hotspot)
- Check university firewall settings
- Use VPN if needed

### Error: "Daily sending quota exceeded"

**Cause:** Sent more than 200 emails today  
**Fix:** Wait until tomorrow OR request production access

### Email goes to Spam

**Cause:** Normal for SES sandbox without domain  
**Fix:**

- Mark as "Not Spam" in Gmail
- In production, would configure SPF/DKIM records

---

## 🚀 **Testing Commands Reference**

```powershell
# Test email connection
cd server
node scripts/test-email-connection.js

# Start server
npm run dev

# View logs
npm run logs

# View error logs only
npm run logs:error

# Check SES sending statistics
# (Do this in AWS Console → SES → Account Dashboard)
```

---

## 📋 **Quick Checklist for Tonight**

- [ ] Create NEW SMTP credentials in AWS SES
- [ ] Update SMTP_USER and SMTP_PASS in `.env`
- [ ] Test email connection (should pass ✅)
- [ ] Verify your Gmail (already done ✅)
- [ ] Verify 2-3 Gmail aliases
- [ ] Optionally verify student email
- [ ] Start server & client
- [ ] Test registration with verified email
- [ ] Receive and click verification email
- [ ] Test password reset flow
- [ ] Take screenshots for FYP report

---

## 🎯 **Summary**

### What You DON'T Need:

❌ Domain name  
❌ Domain verification  
❌ Production access  
❌ DNS configuration  
❌ SPF/DKIM records

### What You DO Need:

✅ Correct SMTP credentials (create new ones!)  
✅ Verified email addresses (at least 2-3)  
✅ Sandbox mode (what you have now)  
✅ 30 minutes to test everything

### Expected Timeline:

- **Fix SMTP credentials:** 5 minutes
- **Verify test emails:** 10 minutes
- **Test all features:** 30 minutes
- **Document for FYP:** 20 minutes
- **Total:** ~1 hour to completion ✅

---

## 💡 **Bonus: Email Alias Testing Script**

Create `server/scripts/test-multiple-users.js`:

```javascript
require("dotenv").config();
const { sendVerificationEmail } = require("../services/email.service");

const testUsers = [
  { email: "afiq.sharifuzan02+buyer@gmail.com", name: "Buyer Test" },
  { email: "afiq.sharifuzan02+seller@gmail.com", name: "Seller Test" },
  { email: "afiq.sharifuzan02+merchant@gmail.com", name: "Merchant Test" },
];

async function testAllUsers() {
  console.log("🧪 Testing email sending to multiple users...\n");

  for (const user of testUsers) {
    try {
      const mockUser = {
        email: user.email,
        profile: { username: user.name },
      };

      await sendVerificationEmail(mockUser, "test-token-123");
      console.log(`✅ Sent to: ${user.email}`);
    } catch (error) {
      console.log(`❌ Failed: ${user.email} - ${error.message}`);
    }
  }

  console.log("\n✅ Test complete! Check your Gmail inbox.");
}

testAllUsers();
```

Run it:

```powershell
node server/scripts/test-multiple-users.js
```

All emails arrive in ONE Gmail inbox! 🎉

---

## 🎊 **Final Words**

**You don't need a domain for your FYP!**

Sandbox mode is:

- ✅ Perfect for development
- ✅ Great for demonstrations
- ✅ Accepted for academic projects
- ✅ Completely FREE
- ✅ Available immediately

**Just fix the SMTP credentials and you're done!** 🚀

The only issue is you used AWS Access Keys instead of SMTP credentials. Create new SMTP credentials and everything will work perfectly.

**Start with Step 1 of Phase 1 NOW!** 👆
