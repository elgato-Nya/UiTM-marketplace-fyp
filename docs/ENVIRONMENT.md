# Environment Setup Guide

## 🔐 Security Notice

**NEVER commit `.env` files to git!** They contain sensitive credentials.

## 📋 Setup Instructions

### 1. Copy Environment Template

```bash
# In project root
cp .env.example .env

# In server directory
cp server/.env.example server/.env
```

### 2. Configure Your Environment

Edit your `.env` files with your actual values:

#### Required Variables:

- `MONGO_URI` - Your MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret for JWT tokens (min 32 characters)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 characters)

#### Optional Variables:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins

### 3. Generate Secure Secrets

For production, generate cryptographically secure secrets:

```bash
# Generate JWT secrets (Node.js)
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## 🌍 Environment Types

### Development (.env)

```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce-dev
LOG_LEVEL=debug
```

### Testing (.env.test)

```env
NODE_ENV=test
MONGO_URI=mongodb://localhost:27017/ecommerce-test
LOG_LEVEL=error
```

### Production (.env.production)

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce-prod
LOG_LEVEL=warn
```

## 🔒 Security Best Practices

1. **Use different secrets for each environment**
2. **Rotate secrets regularly**
3. **Use environment variables in production**
4. **Never log sensitive values**
5. **Use strong, random passwords**

## 📂 File Structure

```
project/
├── .env.example          # Template (commit this)
├── .env                  # Your local config (DO NOT commit)
├── server/
│   ├── .env.example      # Server template (commit this)
│   └── .env              # Server config (DO NOT commit)
```

## 🚨 What to Do If You Accidentally Commit Secrets

1. **Immediately change all exposed credentials**
2. **Remove from git history:** `git filter-branch` or BFG Repo-Cleaner
3. **Force push:** `git push --force`
4. **Notify team members to pull latest changes**
