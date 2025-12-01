# ✅ PRE-PUSH SAFETY CHECKLIST & TROUBLESHOOTING GUIDE

**Generated:** November 27, 2025  
**Status:** Ready for verification before push to main

---

## 🔍 CRITICAL VERIFICATION (DO THIS FIRST!)

### ✅ **1. Environment Files Safety Check**

```powershell
# Verify .env files are ignored
git status --ignored | Select-String -Pattern "\.env"
```

**Expected:** Should show `.env` files in ignored section  
**✅ VERIFIED:** All .env files are properly ignored! Safe to proceed.

---

### ✅ **2. Node Modules Safety Check**

```powershell
# Verify node_modules are not tracked
git status | Select-String -Pattern "node_modules"
```

**Expected:** Should return NOTHING (empty)  
**✅ VERIFIED:** node_modules properly ignored!

---

### ✅ **3. Git Remote Configuration**

```powershell
git remote -v
```

**Expected Output:**

```
origin  https://github.com/elgato-Nya/UiTM-marketplace-fyp.git (fetch)
origin  https://github.com/elgato-Nya/UiTM-marketplace-fyp.git (push)
```

**✅ VERIFIED:** Remote is correctly configured!

---

### ✅ **4. File Count Verification**

```powershell
(git status --porcelain | Measure-Object -Line).Lines
```

**Expected:** ~177 files (your commit plan covers 409 changes, some already staged)  
**✅ CURRENT COUNT:** 177 changes detected

---

## 🧪 RECOMMENDED PRE-PUSH TESTS

### **Option A: Quick Syntax Check (2 minutes)**

```powershell
# Check server syntax
cd server
node -c index.js
cd ..

# Check client build (optional but recommended)
cd client
npm run build
cd ..
```

### **Option B: Full Test Suite (10-15 minutes)**

```powershell
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test -- --watchAll=false
cd ..
```

### **Option C: Skip Tests, Push Directly (FASTEST)**

If you're confident, you can push directly and let GitHub Actions handle testing.

---

## 🚀 WHAT TO EXPECT WHEN YOU PUSH

### **Immediate Actions:**

1. **Git Push Progress**

   - Counting objects
   - Compressing objects
   - Writing objects to GitHub
   - **Expected Time:** 2-5 minutes (depending on internet)

2. **GitHub Actions Triggers Automatically**
   - ✅ **CI Workflow** (`ci.yml`) - Runs tests and builds
   - ✅ **Deploy Workflow** (`deploy-aws.yml`) - Deploys to EC2
   - **Expected Time:** 5-10 minutes total

---

## 🎯 GITHUB ACTIONS - WHAT HAPPENS

### **Job 1: CI Workflow (Continuous Integration)**

```
✓ Checkout code
✓ Setup Node.js 20.x
✓ Install dependencies (server & client)
✓ Run linter (will skip if no lint script)
✓ Run tests
✓ Build client
✓ Security scan (npm audit)
```

**Possible Issues & Solutions:**

#### ❌ **Issue: "Missing script: lint"**

**Why:** Your server/client doesn't have a lint script (we confirmed this)  
**Solution:** GitHub Actions uses `--if-present` flag, so it will skip gracefully  
**Action:** ✅ NO ACTION NEEDED

#### ❌ **Issue: Tests fail**

**Why:** Some tests might fail due to missing environment variables  
**Solution:**

```powershell
# Run tests locally first
cd server
npm test

# If specific tests fail, you can skip them temporarily
npm test -- --testPathIgnorePatterns=integration
```

#### ❌ **Issue: Build fails**

**Why:** Missing dependencies or syntax errors  
**Solution:**

```powershell
cd client
npm ci
npm run build
```

**Fix errors before pushing**

---

### **Job 2: Deploy Workflow (AWS EC2 Deployment)**

```
✓ Checkout code
✓ Deploy to EC2 via SSH
  - Pull latest code
  - Install dependencies
  - Restart PM2 backend
  - Build React frontend
✓ Health check
```

**Possible Issues & Solutions:**

#### ❌ **Issue: "Permission denied (publickey)"**

**Why:** GitHub Secrets not configured  
**Solution:** Add these secrets in GitHub (see GITHUB-SECRETS-SETUP.md):

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`

**Temporary Fix:** Comment out deploy job if EC2 not ready yet:

```yaml
# In .github/workflows/deploy-aws.yml
# Comment out lines 11-110 (entire deploy job)
```

#### ❌ **Issue: "pm2 command not found"**

**Why:** PM2 not installed on EC2  
**Solution:**

```bash
# SSH into EC2 first
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
sudo npm install -g pm2
```

#### ❌ **Issue: "git pull failed"**

**Why:** EC2 doesn't have the repo cloned yet  
**Solution:**

```bash
# SSH into EC2
mkdir -p /home/ubuntu/ecommerce-project
cd /home/ubuntu/ecommerce-project
git clone https://github.com/elgato-Nya/UiTM-marketplace-fyp.git .
```

---

## 🛡️ SAFETY NETS (IF SOMETHING FAILS)

### **1. GitHub Actions Fails = Your Local Code is Safe**

- Failed CI/CD doesn't affect your local code
- You can fix issues and push again
- GitHub keeps all commit history

### **2. If Tests Fail:**

```powershell
# Option A: Fix tests locally and push again
git add .
git commit -m "fix: resolve test failures"
git push

# Option B: Disable failing tests temporarily
# Edit test files to skip tests with .skip()
test.skip('problematic test', () => { ... })
```

### **3. If Build Fails:**

```powershell
# Test build locally
cd client
npm ci
npm run build

# If successful, push again
# If fails, fix errors in code
```

### **4. If Deployment Fails:**

```powershell
# Deployment failure doesn't break GitHub
# You can:
# - Fix EC2 setup and re-run deployment manually
# - Or disable deployment temporarily
```

---

## 🎬 RECOMMENDED EXECUTION PLAN

### **Plan A: Safe & Thorough (RECOMMENDED)**

```powershell
# 1. Quick syntax check
cd server
node -c index.js
cd ../client
npm run build
cd ..

# 2. Execute commit plan (Groups 1-65)
# Follow DEPLOYMENT-GIT-COMMIT-PLAN.md

# 3. Push to GitHub
git push -u origin main

# 4. Monitor GitHub Actions
# Go to: https://github.com/elgato-Nya/UiTM-marketplace-fyp/actions

# 5. If CI passes but deploy fails (expected if EC2 not ready)
# - No problem! Fix EC2 and re-run deployment
```

### **Plan B: Quick Push (FASTEST)**

```powershell
# 1. Execute ALL commits at once (faster but messier history)
git add .
git commit -m "feat: complete MERN marketplace with all features"
git push -u origin main

# 2. Monitor GitHub Actions
# 3. Fix any issues in subsequent commits
```

### **Plan C: Disable Deployment First**

```powershell
# 1. Temporarily disable deployment
# Edit .github/workflows/deploy-aws.yml
# Comment out the entire 'deploy' job (lines 11-110)

# 2. Commit the change
git add .github/workflows/deploy-aws.yml
git commit -m "chore: temporarily disable deployment"

# 3. Execute remaining commits
# 4. Push
# 5. Set up EC2 properly
# 6. Re-enable deployment in another commit
```

---

## 📊 EXPECTED GITHUB ACTIONS RESULT

### **Best Case Scenario (All Green ✅):**

```
✅ CI Workflow (5 mins)
  ✅ lint-and-test / server
  ✅ lint-and-test / client
  ✅ build
  ✅ security-scan

✅ Deploy Workflow (3 mins)
  ✅ Deploy to EC2
  ✅ Health Check
```

### **Most Likely Scenario (CI Passes, Deploy Pending):**

```
✅ CI Workflow (5 mins)
  ✅ lint-and-test / server
  ✅ lint-and-test / client
  ✅ build
  ⚠️ security-scan (might show warnings, that's OK)

❌ Deploy Workflow (Expected to fail if EC2 not configured)
  ❌ Deploy to EC2 - Permission denied
```

**This is NORMAL if you haven't set up EC2 yet!**

---

## 🔥 EMERGENCY ROLLBACK (IF NEEDED)

### **If Something Goes VERY Wrong:**

```powershell
# 1. Your local code is ALWAYS safe
# 2. To undo last commit (if not pushed yet)
git reset --soft HEAD~1

# 3. If already pushed, create a revert commit
git revert HEAD
git push

# 4. Or force push (USE WITH CAUTION)
git push -f origin main
```

---

## ✅ FINAL PRE-PUSH CHECKLIST

- [ ] ✅ All .env files are ignored
- [ ] ✅ node_modules are ignored
- [ ] ✅ Git remote is configured
- [ ] ✅ Syntax check passed (`node -c index.js`)
- [ ] ⚠️ GitHub Secrets configured (or deployment disabled)
- [ ] ✅ Commit plan reviewed (DEPLOYMENT-GIT-COMMIT-PLAN.md)
- [ ] ✅ Ready to monitor GitHub Actions after push

---

## 🎯 DECISION TIME

### **You Should Push NOW If:**

- ✅ All checks above passed
- ✅ You're okay with CI running tests on GitHub
- ✅ You're okay with deployment failing (if EC2 not ready)
- ✅ You want to see your code on GitHub

### **You Should Wait If:**

- ❌ You want to test everything locally first
- ❌ You want to set up EC2 before pushing
- ❌ You're not sure about something

---

## 🚀 READY TO PUSH?

```powershell
# Execute this when ready:
git push -u origin main

# Then immediately go to:
# https://github.com/elgato-Nya/UiTM-marketplace-fyp/actions

# Watch the magic happen! 🎉
```

---

## 📞 MONITORING AFTER PUSH

```powershell
# 1. Watch GitHub Actions
# https://github.com/elgato-Nya/UiTM-marketplace-fyp/actions

# 2. Check logs if something fails
# Click on failed job → Expand failed step → Read error message

# 3. Fix and push again if needed
git add .
git commit -m "fix: address CI/CD issues"
git push
```

---

**✅ YOU'RE READY! The commit plan is solid. Push with confidence!**

**⚠️ Expected Issues:** Deploy workflow will likely fail if EC2 not set up yet - THIS IS NORMAL!  
**✅ Good News:** CI should pass, and your code will be safely on GitHub!

🚀 **GO FOR IT!**
