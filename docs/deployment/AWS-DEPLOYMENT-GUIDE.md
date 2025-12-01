# AWS Deployment Guide

Complete guide for deploying the UiTM E-Commerce Marketplace to AWS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                        │
│  (Client Distribution with Custom Domain & SSL)            │
└──────────────────┬──────────────────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                              │
    ▼                              ▼
┌─────────┐                  ┌──────────┐
│   S3    │                  │   ALB    │
│ Client  │                  │  (opt)   │
│ Bucket  │                  └─────┬────┘
└─────────┘                        │
                                   ▼
                             ┌──────────┐
                             │   EC2    │
                             │  Server  │
                             │  (PM2)   │
                             └─────┬────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
               ┌──────────┐              ┌──────────┐
               │ MongoDB  │              │   S3     │
               │  Atlas   │              │ Images   │
               └──────────┘              └──────────┘
```

---

## Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured
- MongoDB Atlas account (free tier works)
- Domain name (optional, but recommended)

---

## Step 1: MongoDB Atlas Setup

1. **Create cluster** at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Choose free tier** (M0 Sandbox)
3. **Select region** closest to your AWS region
4. **Create database user**:
   - Username: `ecommerce-api`
   - Password: Generate strong password
5. **Whitelist IP**: Add `0.0.0.0/0` (or restrict to EC2 IP later)
6. **Get connection string**:
   ```
   mongodb+srv://ecommerce-api:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

---

## Step 2: Create AWS Infrastructure

### 2.1 Create S3 Buckets

**Client Bucket** (Static hosting):

```bash
aws s3 mb s3://uitm-ecommerce-client --region ap-southeast-1
aws s3 website s3://uitm-ecommerce-client \
  --index-document index.html \
  --error-document index.html
```

**Deployment Bucket** (Private):

```bash
aws s3 mb s3://uitm-ecommerce-deploys --region ap-southeast-1
aws s3api put-bucket-versioning \
  --bucket uitm-ecommerce-deploys \
  --versioning-configuration Status=Enabled
```

**Images Bucket** (Public read):

```bash
aws s3 mb s3://uitm-ecommerce-images --region ap-southeast-1
```

### 2.2 Create EC2 Instance

1. **Launch EC2**:

   - AMI: Amazon Linux 2023
   - Instance type: `t3.micro` (free tier) or `t3.small` (production)
   - Storage: 20 GB gp3
   - Key pair: Create new key pair and download `.pem` file

2. **Security Group Rules**:

   ```
   Inbound:
   - SSH (22) from Your IP
   - HTTP (80) from 0.0.0.0/0
   - HTTPS (443) from 0.0.0.0/0
   - Custom TCP (5000) from 0.0.0.0/0  # For direct API access (optional)

   Outbound:
   - All traffic
   ```

3. **Tag Instance**: `Name=ecommerce-api-prod`

4. **Elastic IP**: Allocate and associate (optional but recommended)

### 2.3 Setup EC2 Instance

**SSH into instance**:

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
```

**Install dependencies**:

```bash
# Update system
sudo yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Install AWS CLI (usually pre-installed)
aws --version
```

**Create app directory**:

```bash
sudo mkdir -p /var/www/ecommerce
sudo chown $USER:$USER /var/www/ecommerce
cd /var/www/ecommerce
```

**Configure PM2**:

```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ecommerce-server',
    script: './server/server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Setup PM2 startup script
pm2 startup
# Run the command it outputs
```

### 2.4 Create CloudFront Distribution

**For Client (React App)**:

```bash
aws cloudfront create-distribution \
  --origin-domain-name uitm-ecommerce-client.s3-website-ap-southeast-1.amazonaws.com \
  --default-root-object index.html
```

**Configure Error Pages** (for React Router):

- 403 → /index.html (200)
- 404 → /index.html (200)

**Note**: Save the Distribution ID for GitHub secrets

### 2.5 Create IAM Role for EC2

**Create role** with these policies:

- `AmazonSSMManagedInstanceCore` (for Systems Manager)
- Custom policy for S3 access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::uitm-ecommerce-deploys/*"
    }
  ]
}
```

**Attach role to EC2 instance**

---

## Step 3: Configure Environment Variables

### Server `.env` (on EC2)

Create `/var/www/ecommerce/server/.env`:

```bash
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://ecommerce-api:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# AWS S3
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=uitm-ecommerce-images
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>

# AWS SES (Email)
SMTP_HOST=email-smtp.ap-southeast-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=UiTM Marketplace

# Client URL
CLIENT_URL=https://yourdomain.com

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Logging
LOG_LEVEL=info
```

**Secure the file**:

```bash
chmod 600 /var/www/ecommerce/server/.env
```

---

## Step 4: Configure GitHub Secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name                  | Value                  | Example                                    |
| ---------------------------- | ---------------------- | ------------------------------------------ |
| `AWS_ACCESS_KEY_ID`          | IAM user access key    | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET_ACCESS_KEY`      | IAM user secret key    | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_DEPLOY_BUCKET`          | Deployment bucket name | `uitm-ecommerce-deploys`                   |
| `AWS_CLIENT_BUCKET`          | Client hosting bucket  | `uitm-ecommerce-client`                    |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront dist ID     | `E1234ABCDEFGH`                            |
| `EC2_INSTANCE_TAG`           | EC2 instance tag value | `ecommerce-api-prod`                       |
| `SERVER_HEALTH_CHECK_URL`    | Server health endpoint | `http://<EC2-IP>:5000/health`              |
| `CLIENT_URL`                 | Client URL             | `https://yourdomain.com`                   |
| `REACT_APP_API_URL`          | API base URL           | `http://<EC2-IP>:5000/api`                 |

**Optional secrets**:
| Secret Name | Value |
|------------|-------|
| `SNYK_TOKEN` | Snyk API token for security scans |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |

---

## Step 5: Initial Manual Deployment

**On your local machine**:

```bash
# 1. Clone repo on EC2
ssh -i your-key.pem ec2-user@<EC2-IP>
cd /var/www/ecommerce
git clone https://github.com/yourusername/ecommerce-project.git .

# 2. Install server dependencies
cd server
npm ci --production

# 3. Start with PM2
cd /var/www/ecommerce
pm2 start ecosystem.config.js --env production
pm2 save

# 4. Verify server is running
curl http://localhost:5000/health

# 5. Setup Nginx reverse proxy (optional but recommended)
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Nginx configuration** (`/etc/nginx/conf.d/ecommerce.conf`):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 6: Test Deployment

### Manual test:

```bash
# Health check
curl http://<EC2-IP>/health

# API test
curl http://<EC2-IP>/api/health
```

### Automated deployment test:

```bash
# Push to main branch
git add .
git commit -m "feat: initial deployment"
git push origin main

# Check GitHub Actions logs
# Open: https://github.com/yourusername/repo/actions
```

---

## Step 7: Setup Custom Domain (Optional)

### Route 53:

1. **Create hosted zone** for your domain
2. **Create A record** pointing to EC2 Elastic IP (for API)
3. **Create CNAME** pointing to CloudFront distribution (for client)

### SSL Certificate (ACM):

1. **Request certificate** in ACM (us-east-1 for CloudFront)
2. **Validate domain** via DNS or email
3. **Associate with CloudFront** distribution
4. **Update CloudFront** to use HTTPS only

---

## Monitoring & Maintenance

### CloudWatch Logs (Server):

```bash
# Install CloudWatch agent on EC2
sudo yum install -y amazon-cloudwatch-agent

# Configure logs
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s
```

### PM2 Monitoring:

```bash
# On EC2
pm2 monit
pm2 logs ecommerce-server
pm2 status
```

### Cost Monitoring:

- Enable AWS Cost Explorer
- Set up billing alerts
- Review monthly usage

---

## Troubleshooting

### Server won't start:

```bash
pm2 logs ecommerce-server --lines 100
# Check .env file exists and has correct values
# Check MongoDB connection string
```

### GitHub Actions deployment fails:

- Verify all secrets are set correctly
- Check EC2 instance has SSM agent running: `sudo systemctl status amazon-ssm-agent`
- Verify IAM roles and permissions

### Client not loading:

- Check S3 bucket policy allows public read
- Verify CloudFront error pages configured for SPA
- Check CORS configuration if API calls fail

---

## Scaling Considerations

### For production:

1. **Use t3.small or larger** EC2 instance
2. **Enable PM2 cluster mode** (multiple instances)
3. **Add Application Load Balancer** for auto-scaling
4. **Use RDS instead of MongoDB Atlas** (if heavy traffic)
5. **Enable CloudFront caching** aggressively
6. **Setup Redis** for session/cache
7. **Use separate S3 bucket** per environment (dev/staging/prod)

---

## Security Checklist

- [ ] Rotate IAM access keys every 90 days
- [ ] Enable MFA on AWS root account
- [ ] Restrict S3 bucket policies to minimum required
- [ ] Use VPC and private subnets for EC2
- [ ] Enable AWS GuardDuty for threat detection
- [ ] Setup WAF rules on CloudFront
- [ ] Enable CloudTrail for audit logs
- [ ] Use Secrets Manager instead of .env files
- [ ] Enable VPC Flow Logs
- [ ] Setup automated backups for MongoDB

---

## Estimated Costs (Monthly)

**Minimal Setup** (Free Tier Eligible):

- EC2 t3.micro: $0-8/month (750 hours free)
- S3 storage (5GB): ~$0.12/month
- S3 requests: ~$0.01/month
- CloudFront (1TB): ~$8.50/month (1GB free)
- Data transfer: Variable
- **Total: ~$10-20/month**

**Production Setup**:

- EC2 t3.small: ~$15/month
- S3 storage (20GB): ~$0.50/month
- CloudFront (10TB): ~$85/month
- ALB: ~$16/month
- Data transfer: ~$9/month
- **Total: ~$125-150/month**

_Note: MongoDB Atlas free tier is separate and included at $0_
