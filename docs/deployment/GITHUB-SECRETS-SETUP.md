# 🔐 GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for your CI/CD deployment pipeline.

---

## 📋 Required GitHub Secrets

Navigate to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

### 1. **EC2_HOST**

- **Description:** Public IP address or domain of your EC2 instance
- **Example Value:** `54.251.123.45` or `api.yourdomain.com`
- **How to get it:**
  ```bash
  # From AWS Console
  EC2 Dashboard → Instances → Select your instance → Copy "Public IPv4 address"
  ```

---

### 2. **EC2_USER**

- **Description:** SSH username for your EC2 instance
- **Common Values:**
  - Amazon Linux: `ec2-user`
  - Ubuntu: `ubuntu`
  - Debian: `admin`
- **Example Value:** `ubuntu`

---

### 3. **EC2_SSH_KEY**

- **Description:** Private SSH key (.pem file content) for EC2 access
- **How to get it:**

  ```bash
  # On your local machine, open your .pem file
  cat ~/path/to/your-key.pem

  # Copy the ENTIRE content including:
  # -----BEGIN RSA PRIVATE KEY-----
  # (all the encoded text)
  # -----END RSA PRIVATE KEY-----
  ```

- **⚠️ CRITICAL:**
  - Copy the **entire** key including the BEGIN and END lines
  - Do NOT share this key publicly
  - Keep newlines intact when pasting

---

### 4. **SERVER_ENV_FILE** (Optional)

- **Description:** Full content of your `server/.env` file
- **When to use:** If you want to inject environment variables via GitHub Secrets instead of managing `.env` directly on EC2
- **Example Value:**
  ```env
  NODE_ENV=production
  PORT=5000
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
  JWT_SECRET=your-super-secret-jwt-key
  JWT_EXPIRES_IN=7d
  AWS_ACCESS_KEY_ID=AKIA...
  AWS_SECRET_ACCESS_KEY=...
  AWS_REGION=ap-southeast-1
  AWS_S3_BUCKET=your-bucket-name
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  EMAIL_HOST=email-smtp.ap-southeast-1.amazonaws.com
  EMAIL_PORT=587
  EMAIL_USER=...
  EMAIL_PASS=...
  CLIENT_URL=https://yourdomain.com
  ```
- **To enable:** Uncomment line 52-53 in `deploy-aws.yml`

---

## 🛠️ How to Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/elgato-Nya/UiTM-marketplace-fyp`
2. Click **Settings** (top navigation)
3. In left sidebar: **Secrets and variables → Actions**
4. Click **New repository secret**
5. Enter:
   - **Name:** (e.g., `EC2_HOST`)
   - **Secret:** (paste the value)
6. Click **Add secret**
7. Repeat for all required secrets

---

## ✅ Verification Checklist

Before pushing to trigger deployment:

- [ ] `EC2_HOST` - Added with your EC2 public IP
- [ ] `EC2_USER` - Added (usually `ubuntu` or `ec2-user`)
- [ ] `EC2_SSH_KEY` - Added with full .pem file content
- [ ] SSH access works from your local machine:
      `bash
    ssh -i your-key.pem ubuntu@YOUR_EC2_IP
    `
- [ ] PM2 is installed on EC2: `pm2 --version`
- [ ] Git is configured on EC2: `git --version`
- [ ] App directory exists: `/home/ubuntu/ecommerce-project`
- [ ] GitHub repo is cloned on EC2
- [ ] Node.js 20.x is installed on EC2

---

## 🚀 EC2 Initial Setup (One-Time)

If you haven't set up your EC2 instance yet, run these commands **via SSH**:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git (if not present)
sudo apt install -y git

# Create app directory
mkdir -p /home/ubuntu/ecommerce-project
cd /home/ubuntu/ecommerce-project

# Clone your repository (use HTTPS or SSH)
git clone https://github.com/elgato-Nya/UiTM-marketplace-fyp.git .

# Set up Git credentials (for auto-pull in CI/CD)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Optional: Set up SSH key for GitHub (for git pull without password)
ssh-keygen -t ed25519 -C "ec2-deployment-key"
cat ~/.ssh/id_ed25519.pub
# Copy this public key and add to GitHub: Settings → SSH and GPG keys

# Install server dependencies
cd server
npm install --only=production

# Create .env file manually (or let CI/CD inject it)
nano .env
# Paste your environment variables, save with Ctrl+X, Y, Enter

# Start server with PM2
pm2 start index.js --name ecommerce-api --env production
pm2 save
pm2 startup # Follow the command it outputs

# Install client dependencies and build
cd ../client
npm install
npm run build

# Optional: Install Nginx (if serving React separately)
# sudo apt install -y nginx
# sudo nano /etc/nginx/sites-available/default
# (Configure Nginx to serve React build and proxy API)
```

---

## 🔄 How Deployment Works

1. **Push to main branch** → GitHub Actions triggers
2. **Workflow connects to EC2** via SSH using your secrets
3. **Git pulls latest code** from main branch
4. **Backend:**
   - Installs dependencies (`npm ci`)
   - Restarts PM2 process (`pm2 restart ecommerce-api`)
5. **Frontend:**
   - Installs dependencies
   - Builds production bundle (`npm run build`)
   - Served by Express or Nginx
6. **Health check** verifies backend is responding

---

## 🐛 Troubleshooting

### Issue: "Permission denied (publickey)"

**Solution:**

- Ensure `EC2_SSH_KEY` contains the full .pem file content
- Check that the key file has correct permissions on EC2: `chmod 400 your-key.pem`

### Issue: "pm2 command not found"

**Solution:**

```bash
sudo npm install -g pm2
```

### Issue: "Git pull failed - authentication required"

**Solution:**

- Set up SSH key on EC2 (see EC2 Initial Setup section)
- Or use GitHub Personal Access Token for HTTPS authentication

### Issue: Deployment succeeds but app doesn't work

**Solution:**

- Check PM2 logs: `pm2 logs ecommerce-api`
- Verify .env file exists: `cat /home/ubuntu/ecommerce-project/server/.env`
- Check if port 5000 is open in EC2 Security Group

---

## 📞 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)

---

**✅ Once secrets are configured, push to main to trigger automatic deployment!**
