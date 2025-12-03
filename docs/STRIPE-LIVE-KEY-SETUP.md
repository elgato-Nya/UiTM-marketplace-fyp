# Stripe Live Key Setup Guide

## 🎯 Overview

This guide will help you safely configure Stripe live keys for your production environment.

---

## ⚠️ CRITICAL SECURITY WARNINGS

### DO NOT:

- ❌ **NEVER** commit live Stripe keys to Git
- ❌ **NEVER** share live keys in chat, email, or public channels
- ❌ **NEVER** use live keys in development environment
- ❌ **NEVER** hardcode keys in source code
- ❌ **NEVER** log live keys to console or files

### DO:

- ✅ **ALWAYS** use environment variables
- ✅ **ALWAYS** keep test keys in development
- ✅ **ALWAYS** use live keys only in production
- ✅ **ALWAYS** rotate keys if compromised
- ✅ **ALWAYS** use different keys per environment

---

## 📋 Step-by-Step Setup

### Step 1: Get Your Stripe Keys

1. **Login to Stripe Dashboard**

   - Go to: https://dashboard.stripe.com/
   - Sign in with your account

2. **Enable Live Mode**

   - Toggle the switch in the top-right corner from "Test mode" to "Live mode"
   - You may need to complete account verification first

3. **Get Your API Keys**

   - Go to: **Developers → API keys**
   - You'll see two types of keys:
     - **Secret key** (starts with `sk_live_...`) - Backend only
     - **Publishable key** (starts with `pk_live_...`) - Can be public

4. **Get Webhook Secret** (if using webhooks)
   - Go to: **Developers → Webhooks**
   - Create or select your webhook endpoint
   - Copy the **Signing secret** (starts with `whsec_...`)

---

### Step 2: Configure Your Environment

#### For Production Server (`.env.production` or production environment variables)

```bash
# ==============================================
# STRIPE LIVE KEYS - PRODUCTION ONLY
# ==============================================

# IMPORTANT: These are LIVE keys - handle with extreme care!
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE

# Payment Configuration (MYR - Malaysian Ringgit)
STRIPE_MINIMUM_AMOUNT=10.00
STRIPE_MINIMUM_AMOUNT_CENTS=1000
STRIPE_CURRENCY=MYR
```

#### For Development (Keep Test Keys in `.env`)

```bash
# ==============================================
# STRIPE TEST KEYS - DEVELOPMENT ONLY
# ==============================================

# NEVER replace these with live keys in development!
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_WEBHOOK_SECRET_HERE

# Payment Configuration
STRIPE_MINIMUM_AMOUNT=10.00
STRIPE_MINIMUM_AMOUNT_CENTS=1000
STRIPE_CURRENCY=MYR
```

---

### Step 3: Update Your Server Configuration

**File: `server/.env.production`**

1. Create a production environment file (if it doesn't exist):

   ```bash
   cd server
   cp .env.example .env.production
   ```

2. Edit `.env.production` and update:

   ```bash
   # Environment
   NODE_ENV=production

   # Database (Production MongoDB Atlas)
   MONGO_URI=mongodb+srv://your-production-db-connection-string

   # JWT Secrets (Generate new ones for production!)
   JWT_ACCESS_SECRET=your-production-access-secret-here
   JWT_REFRESH_SECRET=your-production-refresh-secret-here

   # CORS (Your production domain)
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

   # AWS S3 (Production bucket)
   AWS_ACCESS_KEY_ID=your-production-aws-key
   AWS_SECRET_ACCESS_KEY=your-production-aws-secret
   AWS_S3_BUCKET_NAME=uitm-marketplace-production

   # Email (Production SES)
   EMAIL_FROM=noreply@yourdomain.com
   CLIENT_URL=https://yourdomain.com

   # Stripe LIVE Keys
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

   # Logging
   ENABLE_FILE_LOGGING=true
   ```

3. **CRITICAL**: Add `.env.production` to `.gitignore`:
   ```bash
   # In project root .gitignore
   .env
   .env.local
   .env.production
   .env.*.local
   server/.env
   server/.env.production
   ```

---

### Step 4: Update Frontend Configuration

**File: `client/.env.production`**

```bash
# Production API URL
REACT_APP_API_URL=https://api.yourdomain.com

# Stripe Publishable Key (Safe to expose)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

**Important**: The publishable key (pk*live*...) is safe to expose in frontend code, but still use environment variables for easy key rotation.

---

### Step 5: Verify Your Configuration

#### Backend Verification

Create a test script: `server/scripts/verify-stripe.js`

```javascript
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function verifyStripe() {
  try {
    console.log("🔍 Verifying Stripe configuration...\n");

    // Check if key is present
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY not found in environment");
      process.exit(1);
    }

    // Check key format
    const key = process.env.STRIPE_SECRET_KEY;
    const isLive = key.startsWith("sk_live_");
    const isTest = key.startsWith("sk_test_");

    if (!isLive && !isTest) {
      console.error("❌ Invalid Stripe key format");
      process.exit(1);
    }

    console.log(`✅ Key format valid: ${isLive ? "LIVE" : "TEST"} mode`);
    console.log(
      `🔑 Key: ${key.substring(0, 12)}...${key.substring(key.length - 4)}\n`
    );

    // Test API connection
    const balance = await stripe.balance.retrieve();
    console.log("✅ Stripe API connection successful");
    console.log(
      `💰 Available balance: ${balance.available[0]?.amount || 0} ${
        balance.available[0]?.currency || "MYR"
      }\n`
    );

    // Warn if using wrong mode
    if (process.env.NODE_ENV === "production" && isTest) {
      console.warn("⚠️  WARNING: Using TEST keys in PRODUCTION environment!");
    }
    if (process.env.NODE_ENV === "development" && isLive) {
      console.warn("⚠️  WARNING: Using LIVE keys in DEVELOPMENT environment!");
    }

    console.log("✅ All checks passed!\n");
  } catch (error) {
    console.error("❌ Stripe verification failed:", error.message);
    process.exit(1);
  }
}

verifyStripe();
```

Run verification:

```bash
cd server
node scripts/verify-stripe.js
```

---

## 🔒 Security Best Practices

### 1. Key Rotation Schedule

**When to rotate keys:**

- Every 90 days (recommended)
- If a team member with key access leaves
- If you suspect keys have been compromised
- After a security incident

**How to rotate:**

1. Generate new keys in Stripe Dashboard
2. Update environment variables
3. Deploy new keys
4. Revoke old keys in Stripe Dashboard

### 2. Access Control

**Who should have access to live keys:**

- ✅ Production DevOps team
- ✅ Senior backend developers
- ✅ System administrators
- ❌ Frontend developers (only need publishable key)
- ❌ Junior developers
- ❌ Third-party contractors

### 3. Monitoring & Alerts

**Set up alerts for:**

- Unusual transaction volumes
- Failed payment attempts
- API errors
- Webhook failures
- Large transactions

**Stripe Dashboard → Developers → Webhooks → Add endpoint:**

```
URL: https://api.yourdomain.com/api/stripe/webhook
Events: payment_intent.succeeded, payment_intent.failed, charge.refunded
```

### 4. Testing Before Going Live

**Test checklist:**

1. ✅ Test payments with test cards in development
2. ✅ Verify webhook delivery
3. ✅ Test refund functionality
4. ✅ Check error handling
5. ✅ Verify email notifications
6. ✅ Test edge cases (declined cards, insufficient funds)

**Stripe test cards:**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Verify Stripe account is fully activated
- [ ] Complete business verification in Stripe
- [ ] Set up webhooks in Stripe Dashboard
- [ ] Test all payment flows in test mode
- [ ] Update `.env.production` with live keys
- [ ] Verify `.gitignore` includes `.env.production`
- [ ] Run verification script
- [ ] Review Stripe Dashboard settings

### Deployment

- [ ] Deploy with environment variables (not files)
- [ ] Use platform secrets manager (AWS Secrets Manager, Heroku Config Vars, etc.)
- [ ] Verify production environment uses live keys
- [ ] Test a small transaction after deployment
- [ ] Monitor Stripe Dashboard for errors

### Post-Deployment

- [ ] Monitor first 24 hours closely
- [ ] Set up Stripe email alerts
- [ ] Document key rotation schedule
- [ ] Train team on payment flow
- [ ] Review payment reconciliation process

---

## 🔧 Platform-Specific Deployment

### AWS (Elastic Beanstalk / ECS)

**Using AWS Secrets Manager:**

1. Store secret in AWS Secrets Manager:

   ```bash
   aws secretsmanager create-secret \
     --name uitm-marketplace/stripe/secret-key \
     --secret-string "sk_live_YOUR_SECRET_KEY"
   ```

2. Grant IAM permissions to your app
3. Retrieve in application code:

   ```javascript
   const AWS = require("aws-sdk");
   const secretsManager = new AWS.SecretsManager();

   const secret = await secretsManager
     .getSecretValue({
       SecretId: "uitm-marketplace/stripe/secret-key",
     })
     .promise();

   const STRIPE_SECRET_KEY = secret.SecretString;
   ```

### Heroku

```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY -a your-app-name
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY -a your-app-name
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET -a your-app-name
```

### Vercel

1. Go to: Project Settings → Environment Variables
2. Add:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_live_YOUR_SECRET_KEY`
   - Environment: Production
3. Redeploy

### Railway

```bash
railway variables set STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
railway variables set STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
```

### DigitalOcean App Platform

1. Go to: App Settings → Environment Variables
2. Add variables
3. Mark as encrypted
4. Deploy

---

## 🆘 Troubleshooting

### Issue: "No such API key"

**Solution:**

- Verify key starts with `sk_live_` or `sk_test_`
- Check for extra spaces or line breaks
- Ensure key is properly set in environment
- Restart server after updating environment variables

### Issue: "This API key is not valid in live mode"

**Solution:**

- You're using a test key (`sk_test_`) in production
- Get live keys from Stripe Dashboard (Live mode)

### Issue: Webhook signature verification failed

**Solution:**

- Verify webhook secret matches Stripe Dashboard
- Check webhook endpoint URL is correct
- Ensure raw body is used (not JSON parsed)
- Verify HTTPS is enabled (required for live webhooks)

### Issue: Payments work in test but not live

**Solution:**

- Verify business verification is complete
- Check payment methods are enabled
- Verify bank account is connected
- Review Stripe account restrictions

---

## 📞 Support & Resources

### Stripe Resources

- **Dashboard**: https://dashboard.stripe.com/
- **Documentation**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Support**: https://support.stripe.com/

### Internal Resources

- Backend config: `server/config/stripe.config.js`
- Checkout service: `server/services/checkout/stripe.service.js`
- Environment docs: `ENVIRONMENT.md`

### Emergency Contacts

- **If keys are compromised**: Immediately revoke in Stripe Dashboard
- **Payment issues**: Check Stripe Dashboard → Logs
- **Technical support**: Contact your DevOps team

---

## ✅ Final Checklist

Before going live with Stripe payments:

- [ ] Stripe account fully verified
- [ ] Live keys obtained from Dashboard
- [ ] Test keys used in development
- [ ] Live keys used in production only
- [ ] Keys stored in environment variables
- [ ] `.env.production` in `.gitignore`
- [ ] Webhooks configured and tested
- [ ] Payment flow tested end-to-end
- [ ] Error handling verified
- [ ] Email notifications working
- [ ] Refund functionality tested
- [ ] Team trained on payment monitoring
- [ ] Alerts configured in Stripe
- [ ] Key rotation schedule documented
- [ ] Emergency procedures documented

---

**Last Updated**: December 2, 2025
**Version**: 1.0.0
