# AWS Services Implementation

Documentation of AWS services used in the UiTM E-Commerce Marketplace.

---

## Services Used

| Service      | Purpose                        |
| ------------ | ------------------------------ |
| **EC2**      | Host backend server + frontend |
| **S3**       | Image storage                  |
| **SES**      | Email notifications            |
| **Route 53** | Domain management              |

---

## 1. AWS EC2

### Instance Details

```
Type: t2.micro
Region: ap-southeast-1
OS: Amazon Linux / Ubuntu
```

### Architecture

```
EC2 Instance
├── Nginx (Port 80/443)
│   └── Serves React build files
├── PM2
│   ├── Server (Node.js API on port 5000)
│   └── Client (Optional - served by Nginx)
└── Node.js
```

### Deployment

```
/home/ubuntu/uitm-marketplace/
├── server/          # Backend API
│   ├── .env
│   └── index.js
└── client/build/    # React production build
```

---

## 2. AWS S3

### Purpose

Store user-uploaded images (products, profiles, shops, documents).

### Bucket Configuration

```
Name: uitm-ecommerce-images
Region: ap-southeast-1
Access: Public read
```

### Folder Structure

```
uitm-ecommerce-images/
├── listings/       # Product images
├── profiles/       # User avatars
├── shops/          # Shop logos
├── documents/      # Verification docs
├── reviews/        # Review images
└── contact/        # Contact form images
```

### Implementation

**Service:** `server/services/upload/s3.service.js`

**Key Functions:**

- `uploadFile()` - Upload image with unique filename
- `deleteFile()` - Delete single file
- `deleteMultipleFiles()` - Bulk delete

**Configuration:** `server/config/s3.config.js`

- Max size: 5 MB
- Allowed: JPEG, PNG, WebP
- Server-side encryption: AES-256

### Environment Variables

```env
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=uitm-ecommerce-images
```

---

## 3. AWS SES (Simple Email Service)

### Purpose

Send transactional emails for user verification and password reset.

### Status

**Production Access** - Can send to any email address.

### Email Types

1. **Email Verification**

   - Sent on user registration
   - Any legitimate email can be used
   - Required for merchant accounts

2. **Password Reset**

   - Sent on forgot password request
   - Contains reset token link

3. **Merchant Verification**
   - Sent to verify merchant is from UiTM
   - Requires UiTM domain email (`@uitm.edu.my`)

### Implementation

**Service:** `server/services/email.aws-sdk.service.js`

Uses AWS SDK v3 (`@aws-sdk/client-ses`) to send emails via HTTPS.

### DNS Records for Email Authentication

SES requires DNS records in Route 53 for domain verification and email authentication.

#### DKIM Records (CNAME)

Verify email sender identity and prevent spoofing. SES provides 3 CNAME records:

```
Name: <token1>._domainkey.nekodez.com
Type: CNAME
Value: <token1>.dkim.amazonses.com

Name: <token2>._domainkey.nekodez.com
Type: CNAME
Value: <token2>.dkim.amazonses.com

Name: <token3>._domainkey.nekodez.com
Type: CNAME
Value: <token3>.dkim.amazonses.com
```

#### SPF Record (TXT)

Authorize AWS SES to send emails from your domain:

```
Name: nekodez.com
Type: TXT
Value: "v=spf1 include:amazonses.com ~all"
```

#### DMARC Record (TXT)

Email policy and reporting:

```
Name: _dmarc.nekodez.com
Type: TXT
Value: "v=DMARC1; p=none; rua=mailto:afiq.sharifuzan02@gmail.com; fo=1"
```

- `p=none` - Monitor mode (don't reject failed emails)
- `rua=mailto:...` - Send reports to this email
- `fo=1` - Report if SPF or DKIM fails

#### Custom MAIL FROM Domain

**MX Record:**

```
Name: no-reply.nekodez.com
Type: MX
Priority: 10
Value: feedback-smtp.ap-southeast-1.amazonses.com
```

**TXT Record:**

```
Name: no-reply.nekodez.com
Type: TXT
Value: "v=spf1 include:amazonses.com ~all"
```

Emails appear from `noreply@nekodez.com` instead of `amazonses.com` or personal email.

### Environment Variables

```env
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
SES_REGION=ap-southeast-1

SMTP_HOST=email-smtp.ap-southeast-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>

EMAIL_FROM=noreply@nekodez.com
EMAIL_FROM_NAME=UiTM Marketplace
```

---

## 4. AWS Route 53

### Purpose

DNS management for custom domain.

### Hosted Zone: `nekodez.com`

#### Domain Records (A Records)

Point domain to EC2 instance:

```
Name: nekodez.com
Type: A
Value: 13.213.42.209

Name: www.nekodez.com
Type: A
Value: 13.213.42.209
```

Both `nekodez.com` and `www.nekodez.com` redirect to EC2 public IP.

#### Email Authentication Records

Route 53 also stores SES-related DNS records (DKIM, SPF, DMARC) documented in Section 3 above.

**Complete DNS Records:**

| Type  | Name                | Value                 | Purpose            |
| ----- | ------------------- | --------------------- | ------------------ |
| A     | nekodez.com         | 13.213.42.209         | Website            |
| A     | www.nekodez.com     | 13.213.42.209         | Website (www)      |
| CNAME | \*.\_domainkey      | \*.dkim.amazonses.com | SES DKIM           |
| TXT   | nekodez.com         | SPF record            | SES SPF            |
| TXT   | \_dmarc.nekodez.com | DMARC policy          | SES DMARC          |
| MX    | no-reply            | feedback-smtp...      | SES MAIL FROM      |
| TXT   | no-reply            | SPF record            | SES Mail subdomain |

### SSL Certificate

**Location:** Nginx on EC2  
**Provider:** Let's Encrypt (certbot, Python)  
**Domains:** `nekodez.com`, `www.nekodez.com`

Summary

- Use certbot (python-based client) to obtain Let’s Encrypt certificates and configure Nginx automatically.
- Keep ports 80 and 443 open in the EC2 security group while provisioning and renewal checks run.

---

## Environment Variables

### Server (.env)

```env
# Node
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=<your-secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# AWS S3
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=uitm-ecommerce-images
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>

# AWS SES
SES_REGION=ap-southeast-1
SMTP_HOST=email-smtp.ap-southeast-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>
EMAIL_FROM=noreply@nekodez.com
EMAIL_FROM_NAME=UiTM Marketplace

# Client
CLIENT_URL=https://nekodez.com
```

---

## Deployment Architecture

```
User Request
    ↓
Route 53 (nekodez.com)
    ↓
EC2 Instance (t2.micro)
    ↓
Nginx (Port 80/443)
    ├── /             → React build (client/build/)
    └── /api          → PM2 → Node.js (port 5000)
                              ↓
                        MongoDB Atlas
                              ↓
                        S3 (image uploads)
```

---

## GitHub Actions Deployment

**Workflow:** `.github/workflows/deploy-aws.yml`

**Process:**

1. Build React app
2. SCP upload to EC2
3. SSH into EC2
4. Pull latest code
5. Restart PM2 services

**Secrets Required:**

```
EC2_HOST
EC2_USER
EC2_SSH_KEY
```

---

## Cost (Approximate)

```
EC2 t2.micro: $8-10/month
S3 Storage: $0.50/month
SES Emails: $0.10/1000 emails
Route 53: $0.50/month
---
Total: ~$10-12/month
```
