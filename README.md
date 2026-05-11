# MarKet - UiTM Marketplace

> A secure, production-ready e-commerce platform for the UiTM community - enabling students, staff, and anyone to buy and sell products and services across campuses with confidence.

**Live:** [nekodez.com](https://nekodez.com)

---

## 🚀 Tech Stack

| Layer              | Technologies                                    |
| ------------------ | ----------------------------------------------- |
| **Frontend**       | React 18.3, Material-UI v7.3, Redux Toolkit 2.9 |
| **Backend**        | Node.js 18+, Express v5.1, MongoDB 5+, Mongoose |
| **Cloud Services** | AWS (EC2, S3, SES, Route 53)                    |
| **Payment**        | Stripe (Checkout v8.2, Webhooks)                |
| **Security**       | JWT, bcrypt, Helmet, express-rate-limit         |
| **Deployment**     | Nginx reverse proxy, PM2, GitHub Actions CI/CD  |
| **Testing**        | Jest, Supertest (415 tests, 100% pass rate)      |

---

## ✨ Key Features

### 👥 For Buyers

- **Browse & Search**: Filter by category, campus, price range
- **Smart Cart**: Persistent cart across sessions
- **Wishlist**: Save items for later
- **Secure Checkout**: Stripe payment integration
- **Order Tracking**: Real-time order status updates
- **Universal Access**: Any email domain accepted for registration

### 🏪 For Merchants

- **UiTM Verification**: Email-based campus verification for instant merchant access
- **Shop Dashboard**: Complete business management interface
- **Product Management**: Create, edit, delete listings with image uploads
- **Order Fulfillment**: Track and manage customer orders
- **Analytics**: Revenue trends, sales metrics, top products
- **Business Profile**: Customizable shop with WhatsApp contact

### 🛡️ For Admins

- **Platform Analytics**: GMV, user growth, merchant metrics
- **Merchant Verification**: Approve/reject merchant applications
- **Moderation Tools**: User management, listing oversight
- **System Monitoring**: Health checks, error logs

---

## 🔒 Security Architecture

| Feature              | Implementation                                   |
| -------------------- | ------------------------------------------------ |
| **Authentication**   | JWT with refresh token rotation                  |
| **Rate Limiting**    | Per-IP limits (trust proxy configured for Nginx) |
| **Input Validation** | Joi schemas + express-validator                  |
| **NoSQL Injection**  | Mongoose sanitization + input filtering          |
| **CORS**             | Whitelist-based origin validation                |
| **Headers**          | Helmet.js security headers                       |
| **Passwords**        | bcrypt with salt rounds                          |
| **File Uploads**     | Validated file types, size limits, S3 storage    |

**Rate Limits:**

- General API: 100 req/15min
- Authentication: 5 attempts/15min
- Email Verification: 3 req/15min
- Password Reset: 5 req/15min

---

## 📁 Project Structure

```
ecommerce-project/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Shared components (forms, cards, buttons)
│   │   │   └── ui/           # UI-specific components (skeletons, loaders)
│   │   ├── pages/            # Route pages
│   │   ├── features/         # Feature-based modules
│   │   │   ├── auth/         # Authentication feature
│   │   │   ├── merchant/     # Merchant features
│   │   │   ├── profile/      # User profile management
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── store/            # Redux store config
│   │   ├── contexts/         # React contexts (theme, auth)
│   │   ├── utils/            # Helper functions
│   │   │   ├── emailUtils.js # Email validation utilities
│   │   │   └── ...
│   │   ├── validation/       # Form validation schemas
│   │   ├── config/           # App configuration
│   │   │   └── forms/        # Form configurations
│   │   └── styles/           # Global styles
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/               # Configuration modules
│   ├── controllers/          # Route controllers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   ├── services/             # Business logic layer
│   ├── middleware/           # Custom middleware
│   ├── validators/           # Validation schemas
│   ├── utils/                # Helper utilities
│   ├── tests/                # Jest test suites
│   │   ├── integration/
│   │   └── unit/
│   ├── scripts/              # Utility scripts
│   ├── jobs/                 # Scheduled tasks
│   ├── data/                 # Seed data
│   └── package.json
│
├── docs/                      # Project Documentation (Root Level)
│   ├── AWS-SERVICES-IMPLEMENTATION.md
│   ├── ENVIRONMENT.md
│   ├── FEATURES.md
│   ├── RATE-LIMITING-EXPLAINED.md
│   ├── SECURITY.md
│   └── TESTING.md
│
├── .github/
│   ├── workflows/            # CI/CD pipelines
│   └── instructions/         # Copilot instructions
│
├── commitlint.config.js      # Commit message linting
├── package.json              # Root package.json
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** 5.0+ (local or Atlas URI)
- **AWS Account** with S3, SES, EC2 access
- **Stripe Account** (test mode for development)

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone https://github.com/elgato-Nya/UiTM-marketplace-fyp.git
cd ecommerce-project

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2️⃣ Environment Configuration

#### **Server** (`server/.env`)

```env
# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/uitm-marketplace

# JWT Secrets (generate with: npm run generate:jwt)
JWT_ACCESS_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS Configuration
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name

# AWS SES (Email Service)
SES_FROM_EMAIL=noreply@nekodez.com

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel

# Rate Limiting (optional overrides)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
TRUST_PROXY=loopback
```

> **Note:** For testing, CLIENT_URL and SES_FROM_EMAIL are automatically set in `jest.env.js`

#### **Client** (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3️⃣ Run Development Servers

```bash
# Terminal 1 - Backend Server
cd server
npm run dev
# Runs on http://localhost:5000

# Terminal 2 - Frontend Server
cd client
npm start
# Runs on http://localhost:3000
```

### 4️⃣ Verify Installation

```bash
# Check environment variables
cd server
npm run env:check

# Run health check
npm run health:check

# Run test suite
npm test
```

---

## 🧪 Testing

```bash
cd server

# Run all tests (359 tests)
npm test

# Run specific test suites
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:config            # Config validation tests

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**

- 20 test suites
- 359 tests (99% pass rate - 356 passing, 3 known issues in address validation)
- Integration tests for all major features
- Unit tests for validators, utilities, configs

> **Known Issues**: 3 tests failing in address.model.test.js due to validation error handling improvements (non-blocking)

---

## 📦 Production Deployment

**Deployed on:** AWS EC2 t2.micro (1 vCPU, 1GB RAM)  
**Architecture:** Nginx → PM2 → Node.js Express  
**Domain:** nekodez.com (Route 53 DNS)  
**CI/CD:** GitHub Actions

### Deployment Stack

1. **Nginx** - Reverse proxy, SSL termination, static file serving
2. **PM2** - Process manager (single instance, no cluster mode)
3. **Node.js** - Express API server (port 5000)
4. **MongoDB Atlas** - Managed database cluster
5. **AWS S3** - Product image storage
6. **AWS SES** - Transactional emails
7. **Stripe** - Payment processing

### Key Configuration

```bash
# Trust proxy
# Local development: TRUST_PROXY=loopback
# Nginx -> Node: TRUST_PROXY=1
# AWS ALB -> Nginx -> Node: TRUST_PROXY=2
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback')

# PM2 ecosystem
pm2 start index.js --name uitm-marketplace --no-daemon
```

See `docs/deployment/` for complete setup guides.

---

## 📊 Analytics System

The platform includes automated analytics calculated every 15 minutes:

### Merchant Analytics

- Revenue trends (daily/weekly/monthly)
- Sales count and average order value
- Top-selling products
- Order status breakdown
- Category performance

### Platform Analytics (Admin)

- Total users and active users
- Merchant verification queue
- Gross Merchandise Value (GMV)
- Growth rates and conversion metrics
- Campus-wise distribution

**Calculation Job:** `server/jobs/analytics.job.js`  
**Scheduled:** Every 15 minutes via cron

---

## 📝 Available Scripts

### Server Scripts

```bash
# Development
npm run dev                # Start with nodemon (auto-restart)
npm start                  # Production start

# Testing
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Utilities
npm run env:check          # Validate environment variables
npm run generate:jwt       # Generate JWT secrets
npm run health:check       # Server health check
npm run db:seed            # Seed database with sample data

# Logs
npm run logs               # View recent logs
npm run logs:error         # Error logs only
npm run logs:cleanup       # Clean old logs
```

### Client Scripts

```bash
npm start                  # Start development server
npm run build              # Production build
npm test                   # Run tests
```

---

## 🌐 API Documentation

**Base URL:** `/api`

### Authentication (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - Login with credentials
- `POST /logout` - Logout (clear refresh token)
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /verify-email` - Verify UiTM email
- `POST /resend-verification` - Resend verification email

### Users (`/api/users`)

- `GET /profile` - Get user profile
- `PATCH /profile` - Update profile
- `GET /addresses` - Get saved addresses
- `POST /addresses` - Add new address
- `PATCH /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address

### Merchants (`/api/merchants`)

- `POST /register` - Apply for merchant account
- `GET /profile` - Get merchant profile
- `PATCH /profile` - Update shop details
- `GET /:slug` - Public shop profile

### Listings (`/api/listings`)

- `GET /` - Browse all listings (public)
- `GET /:id` - Get listing details (public)
- `POST /` - Create listing (merchant)
- `PATCH /:id` - Update listing (merchant)
- `DELETE /:id` - Delete listing (merchant)
- `GET /merchant` - Get own listings (merchant)

### Cart (`/api/cart`)

- `GET /` - Get cart items
- `POST /add` - Add to cart
- `PATCH /update/:id` - Update quantity
- `DELETE /remove/:id` - Remove item
- `DELETE /clear` - Clear cart

### Wishlist (`/api/wishlist`)

- `GET /` - Get wishlist
- `POST /add` - Add to wishlist
- `DELETE /remove/:id` - Remove from wishlist

### Orders (`/api/orders`)

- `POST /` - Create order
- `GET /` - Get order history
- `GET /:id` - Get order details
- `PATCH /:id/status` - Update order status (merchant)

### Checkout (`/api/checkout`)

- `POST /create-session` - Create Stripe checkout
- `POST /webhook` - Stripe webhook handler

### Analytics (`/api/analytics`)

- `GET /merchant` - Merchant dashboard data
- `POST /merchant/refresh` - Manual refresh

### Admin (`/api/admin`)

- `GET /analytics` - Platform analytics
- `GET /merchants` - All merchants
- `PATCH /merchants/:id/verify` - Verify merchant
- `GET /users` - All users
- `PATCH /users/:id/role` - Update user role

---

## 🤝 Contributing

### Commit Convention

This project uses [commitlint](https://commitlint.js.org/) with conventional commits:

```bash
type(scope): brief description

- Detail point 1
- Detail point 2
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`

**Examples:**

```bash
feat(checkout): add stripe payment integration

- Implement checkout session creation
- Add webhook for payment confirmation
- Handle payment success/failure flows
```

```bash
fix(security): improve rate limiting configuration

- Set TRUST_PROXY based on your proxy chain (`loopback` locally, `1` for Nginx -> Node, `2` for AWS ALB -> Nginx -> Node)
- Move rate limiters before body parsing
- Add retry-after headers
```

### Development Workflow

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes with tests
3. Run tests: `npm test`
4. Commit with convention: `git commit`
5. Push and create PR

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 About the Developer

**Built by [Nekodez](https://nekodez.com/about/nekodez) 🐱**

Full-stack developer passionate about building secure, scalable, and user-friendly web applications. Specializing in the MERN stack with a focus on system architecture, security best practices, and production-ready code.

_"To build meaningful, reliable, and future-proof digital products while growing as a developer and as a person."_

---

## 📚 Documentation

For detailed guides and documentation:

- **[Security Documentation](docs/SECURITY.md)** - Security measures and best practices
- **[Testing Guide](docs/TESTING.md)** - Testing strategy and examples
- **[Environment Variables](docs/ENVIRONMENT.md)** - Comprehensive env vars reference
- **[Features Overview](docs/FEATURES.md)** - Detailed feature documentation
- **[AWS Services Implementation](docs/AWS-SERVICES-IMPLEMENTATION.md)** - AWS integration details
- **[Rate Limiting Explained](docs/RATE-LIMITING-EXPLAINED.md)** - Rate limiting configuration

---

**Questions?** Open an issue or check the `/docs` folder for more information.
