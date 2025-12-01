# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. `ci.yml` - Continuous Integration

**Triggers**: Push to `main`/`dev` branches, Pull Requests to `main`

**Jobs**:

- **Lint & Test**: Runs ESLint and Jest tests for both server and client
- **Build Check**: Verifies production builds succeed
- **Security Scan**: Runs npm audit and Snyk vulnerability scanning

### 2. `deploy-aws.yml` - AWS Deployment

**Triggers**: Push to `main` branch, Manual workflow dispatch

**Jobs**:

- **Deploy Server**: Deploys Express API to EC2 via SSM and PM2
- **Deploy Client**: Builds React app and deploys to S3 with CloudFront invalidation
- **Notify**: Sends Slack notification about deployment status

---

## Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

### AWS Credentials

- `AWS_ACCESS_KEY_ID` - AWS access key with permissions for S3, EC2, SSM, CloudFront
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_DEPLOY_BUCKET` - S3 bucket for server deployment packages (e.g., `my-app-deploys`)
- `AWS_CLIENT_BUCKET` - S3 bucket for client static hosting (e.g., `my-app-client`)
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID for cache invalidation

### EC2 Configuration

- `EC2_INSTANCE_TAG` - EC2 instance tag for SSM targeting (e.g., `ecommerce-api-prod`)

### Health Check URLs

- `SERVER_HEALTH_CHECK_URL` - Server health endpoint (e.g., `https://api.example.com/health`)
- `CLIENT_URL` - Client URL to verify deployment (e.g., `https://example.com`)

### Environment Variables

- `REACT_APP_API_URL` - API base URL for React app (e.g., `https://api.example.com`)

### Optional Secrets

- `SNYK_TOKEN` - Snyk API token for vulnerability scanning
- `SLACK_WEBHOOK_URL` - Slack webhook for deployment notifications

---

## AWS Infrastructure Requirements

### EC2 Instance Setup

1. **Install dependencies**:

   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm
   npm install -g pm2
   ```

2. **Create app directory**:

   ```bash
   sudo mkdir -p /var/www/ecommerce
   sudo chown $USER:$USER /var/www/ecommerce
   ```

3. **Configure PM2**:

   ```bash
   cd /var/www/ecommerce/server
   pm2 start ecosystem.config.js --env production
   pm2 startup
   pm2 save
   ```

4. **Enable SSM**:
   - Attach IAM role with `AmazonSSMManagedInstanceCore` policy
   - Tag instance: `Name=ecommerce-api-prod`

### S3 Buckets

1. **Server Deploy Bucket** (`AWS_DEPLOY_BUCKET`):

   - Private bucket for deployment packages
   - Enable versioning

2. **Client Static Hosting** (`AWS_CLIENT_BUCKET`):
   - Enable static website hosting
   - Set bucket policy for public read access
   - Configure CORS if needed

### CloudFront Distribution

- Origin: S3 client bucket
- Default root object: `index.html`
- Error pages: Redirect 404/403 to `/index.html` (for React Router)
- SSL certificate: Use ACM or CloudFront default

### IAM Permissions

The GitHub Actions user needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-DEPLOY-BUCKET/*",
        "arn:aws:s3:::YOUR-CLIENT-BUCKET/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["ssm:SendCommand", "ssm:GetCommandInvocation"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::*:distribution/YOUR-DISTRIBUTION-ID"
    }
  ]
}
```

---

## Deployment Flow

1. **Developer pushes to `main`**
2. **CI workflow runs** (lint, test, build)
3. **If CI passes, deploy workflow triggers**
4. **Server deployment**:
   - Zip server code
   - Upload to S3
   - Use SSM to download and deploy on EC2
   - PM2 restart with zero-downtime
5. **Client deployment**:
   - Build React app with production env vars
   - Sync to S3 with proper cache headers
   - Invalidate CloudFront cache
6. **Verify deployments** via health checks
7. **Send Slack notification**

---

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
choco install act-cli  # Windows
brew install act       # macOS

# Run CI workflow
act -j lint-and-test

# Run deployment workflow (with secrets file)
act -j deploy-server --secret-file .secrets
```

---

## Troubleshooting

### Deployment fails with "Cannot connect to EC2"

- Check EC2 instance has SSM agent running
- Verify IAM role attached to instance
- Check security group allows outbound HTTPS (443)

### CloudFront still serves old content

- Increase invalidation wait time in workflow
- Check CloudFront behavior cache settings
- Verify S3 cache-control headers

### PM2 restart fails

- SSH into EC2 and check: `pm2 logs ecommerce-server`
- Verify environment variables in `ecosystem.config.js`
- Check Node.js version matches development

---

## Cost Optimization Tips

1. **Use S3 Lifecycle policies** to delete old deployment packages after 30 days
2. **Enable CloudFront compression** for smaller transfer sizes
3. **Use EC2 Reserved Instances** if running 24/7
4. **Monitor AWS costs** with AWS Cost Explorer
