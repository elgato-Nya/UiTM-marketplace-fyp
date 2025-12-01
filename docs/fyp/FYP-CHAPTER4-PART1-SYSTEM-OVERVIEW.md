# FYP Chapter 4 - Part 1: System Overview & Development Stack

## COMPREHENSIVE TECHNICAL DOCUMENTATION

**Project**: UiTM Marketplace E-Commerce Platform  
**Purpose**: Final Year Project - Chapter 4 Implementation Documentation  
**Generated**: November 2025

---

## 1. SYSTEM OVERVIEW

### 1.1 Platform Purpose and Concept

The **UiTM Marketplace** is a comprehensive e-commerce platform specifically designed for the UiTM (Universiti Teknologi MARA) community. The platform serves as a centralized marketplace where students, faculty, and staff can:

- **Buy and Sell Products**: Physical items such as textbooks, electronics, furniture, stationery, and other goods
- **Offer and Purchase Services**: Academic tutoring, assignment help, graphic design, photography, event services
- **Conduct Secure Transactions**: Integrated payment processing with Stripe (FPX, GrabPay, Credit/Debit cards)
- **Campus-Specific Trading**: Location-aware listings filtered by campus (Shah Alam, Puncak Alam, Segamat, etc.)
- **Merchant Operations**: Business owners can create shops, manage inventory, track sales, and access analytics

### 1.2 Primary User Roles

The system implements a **three-tier role-based access control (RBAC)** architecture:

#### **1.2.1 Consumer (Student/Staff Buyer)**

**Registration Requirements**:

- Valid UiTM email address (`@student.uitm.edu.my` or `@uitm.edu.my`)
- Phone number verification
- Campus and faculty affiliation
- Username and profile information

**Capabilities**:

- Browse products and services by category/campus
- Search and filter listings with advanced criteria
- Add items to cart (maximum 50 items)
- Add items to wishlist (maximum 100 items)
- Purchase items with multiple payment methods (Stripe FPX/Cards/GrabPay, Cash on Delivery)
- Complete checkout with delivery address management
- Track order status and history
- Leave reviews and ratings (NOT IMPLEMENTED YET)
- Manage multiple delivery addresses
- View purchase history with order details
- Receive email notifications for order updates

#### **1.2.2 Merchant (Vendor/Seller)**

**Upgrade Requirements**:

- Active consumer account
- Stripe Connect account creation (for online payments)
- Shop name and slug (unique identifier)
- Business information and verification

**Capabilities**:

- All consumer capabilities +
- Create and manage product/service listings
- Upload multiple images per listing (3-10 images)
- Set pricing, stock levels, and availability
- Manage orders (confirm, ship, complete, cancel)
- Access merchant analytics dashboard
  - Total sales revenue
  - Order statistics
  - Product performance
  - Customer demographics
  - Sales trends over time
- View sales history with buyer information
- Manage shop profile and settings
- Receive email notifications for new orders
- Track inventory levels with low-stock alerts
- Categorize listings (Electronics, Books, Clothing, Services, etc.)

#### **1.2.3 Admin (Platform Administrator)**

**Hierarchy**:

- **Super Admin**: Full system access including financial data
- **Moderator**: Content moderation and user management (no financial access)

**Capabilities**:

- All consumer and merchant capabilities +
- Access platform-wide analytics
  - Total users (consumers, merchants, admins)
  - Active users (daily, weekly)
  - User growth rate
  - Listing statistics (by category, by type)
  - Order metrics and GMV (Gross Merchandise Value)
  - Merchant verification status
  - Campus-wise distribution
  - Peak activity tracking
- User management
  - View all users
  - Suspend/activate accounts
  - Role assignment
  - Verify merchant accounts
- Listing management
  - View all listings
  - Moderate inappropriate content
  - Remove/flag listings
- Order oversight
  - View all orders across platform
  - Access buyer and seller information
  - Resolve disputes (FEATURE PLANNED)
- System monitoring
  - Health checks
  - Error logs
  - Security events

### 1.3 Core System Functions

#### **1.3.1 User Management**

- **Registration & Authentication**

  - Email validation (UiTM domain only)
  - Password hashing with bcrypt (12 salt rounds)
  - JWT-based authentication (access + refresh tokens)
  - Token rotation with maximum 5 refresh tokens per user
  - Session management with automatic refresh
  - Role-based route protection

- **Profile Management**
  - Avatar upload to AWS S3
  - Username, bio, phone number
  - Campus and faculty selection
  - Multiple address management (shipping/billing)
  - Default address selection per type
  - Account activity tracking

#### **1.3.2 Listing Management**

- **Product Listings**

  - Name, description, price, category
  - Multiple image upload (AWS S3)
  - Stock inventory tracking
  - Availability toggle
  - Free item marking
  - Seller information denormalization

- **Service Listings**

  - Similar to products but without stock management
  - Always considered "in stock"
  - Category-specific filtering

- **Search & Discovery**
  - Full-text search (MongoDB text indexes)
  - Category filtering
  - Price range filtering
  - Campus-based filtering
  - Type filtering (product/service)
  - Sorting (newest, price low-high, price high-low)
  - Fuzzy search with Fuse.js on frontend

#### **1.3.3 Shopping Cart System**

- **Cart Operations**

  - Add item with quantity validation
  - Update item quantity
  - Remove individual items
  - Clear entire cart
  - Cart limit enforcement (50 items)
  - Automatic cart creation per user
  - Stock validation before checkout
  - Price consistency checks

- **Wishlist Operations**
  - Add/remove items
  - Move items to cart
  - Price tracking (stores price when added)
  - Wishlist limit (100 items)
  - Clear entire wishlist
  - Duplicate prevention

#### **1.3.4 Checkout & Payment System**

- **Checkout Session Management**

  - Cart-based checkout
  - Direct purchase (Buy Now)
  - Session expiry (10 minutes)
  - Stock reservation during checkout
  - Automatic session cleanup

- **Payment Processing**

  - Stripe Payment Intents API
  - Payment methods supported:
    - FPX (Malaysian bank transfer)
    - Credit/Debit cards (Visa, Mastercard, etc.)
    - GrabPay
    - Cash on Delivery (COD)
  - Minimum payment amount: RM 10.00
  - Platform fee calculation (5% tiered structure)
  - Payment verification and confirmation
  - Automatic order creation after payment success

- **Order Management**
  - Multi-seller order splitting (one order per seller)
  - Order number generation (ORD-YYYYMMDD-XXXXX)
  - Order status workflow:
    - Pending → Confirmed → Shipped → Delivered → Completed
    - Cancellation allowed in Pending/Confirmed states
  - Status history tracking with timestamps
  - Buyer and seller views
  - Delivery address management
  - Order notes (buyer/seller)
  - Payment status tracking
  - COD confirmation workflow

#### **1.3.5 Analytics System**

- **Merchant Analytics** (Per-seller)

  - Total sales revenue
  - Order count (total, today, this week)
  - Product performance by category
  - Sales trends over time (daily, weekly, monthly)
  - Top-performing products
  - Customer locations (campus distribution)
  - Average order value
  - Listing statistics (total, active, by type)

- **Platform Analytics** (Admin-only)
  - User metrics (total, by role, growth rate)
  - Listing metrics (total, by category, by type)
  - Order metrics (GMV, average order value)
  - Merchant metrics (verified, pending, active)
  - Activity metrics (logins, orders, new listings)
  - Campus-wise distribution
  - Automated daily calculation (cron job)

#### **1.3.6 Image Upload System**

- **AWS S3 Integration**
  - Direct upload to S3 bucket
  - Image optimization with Sharp library
  - Automatic resizing (max 800x800px)
  - JPEG compression (85% quality)
  - Unique filename generation with timestamps
  - Metadata storage (original filename, uploader)
  - Folder organization (listings/, profiles/, etc.)
  - Presigned URL generation for temporary access

#### **1.3.7 Email Notification System** (Planned - Not Fully Implemented)

- Order confirmation emails
- Payment success notifications
- Seller new order alerts
- Order status updates
- Account verification emails
- Password reset emails
- AWS SES integration planned

#### **1.3.8 Security Features**

- **Authentication Security**

  - JWT access tokens (15-minute expiry)
  - JWT refresh tokens (7-day expiry)
  - HTTP-only cookies for refresh tokens
  - Token blacklisting/rotation
  - Secure password hashing (bcrypt)
  - Timing attack mitigation in login

- **Input Validation**

  - Express Validator for all inputs
  - Mongoose schema validation
  - Custom validators (email, phone, username)
  - XSS protection with sanitize-html
  - MongoDB injection prevention

- **Rate Limiting**

  - General API: 1000 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes
  - Exponential backoff with express-slow-down

- **Security Headers**
  - Helmet.js for security headers
  - CSP (Content Security Policy)
  - HSTS (HTTP Strict Transport Security)
  - X-Frame-Options: DENY
  - XSS Protection headers

---

## 2. DEVELOPMENT STACK & ENVIRONMENT

### 2.1 Frontend Technologies

#### **2.1.1 Core Framework**

- **React 18.3.1**
  - Functional components with Hooks
  - React Router DOM 7.9.1 for routing
  - Concurrent rendering features
  - Suspense and lazy loading

#### **2.1.2 State Management**

- **Redux Toolkit (@reduxjs/toolkit) 2.9.0**
  - Centralized application state
  - Redux slices for features:
    - Auth slice (user authentication)
    - Profile slice (user profile data)
    - Address slice (delivery addresses)
    - Listing slice (product/service listings)
    - Cart slice (shopping cart state)
    - Wishlist slice (wishlist state)
    - Checkout slice (checkout session)
    - Order slice (order history)
    - Analytics slice (merchant/admin analytics)
    - Upload slice (image upload state)
  - Redux DevTools integration (development only)

#### **2.1.3 UI Framework & Styling**

- **Tailwind CSS 4.1.13**

  - Utility-first CSS framework
  - Custom theme configuration
  - Responsive design utilities
  - Dark mode support (configured but not fully implemented)
  - Tailwind Merge (3.3.1) for class conflict resolution
  - Tailwind Animate (1.0.7) for animations

- **Material-UI (@mui/material) 7.3.2**

  - Pre-built React components
  - Data Grid (@mui/x-data-grid 8.11.3) for tables
  - Date Pickers (@mui/x-date-pickers 8.11.3)
  - Emotion styling (@emotion/react, @emotion/styled)
  - Custom theme with Tailwind integration

- **Radix UI (Unstyled Components)**

  - @radix-ui/react-avatar 1.1.10
  - @radix-ui/react-checkbox 1.3.3
  - @radix-ui/react-dialog 1.1.15
  - @radix-ui/react-dropdown-menu 2.1.16
  - @radix-ui/react-label 2.1.7
  - @radix-ui/react-select 2.2.6
  - @radix-ui/react-separator 1.1.7
  - @radix-ui/react-slot 1.2.3
  - @radix-ui/react-tabs 1.1.13
  - @radix-ui/react-toast 1.2.15

- **Icon Library**

  - Lucide React 0.544.0 (modern icon set)
  - Material Icons (@mui/icons-material 7.3.2)

- **Utility Libraries**
  - clsx 2.1.1 - Conditional classNames
  - class-variance-authority 0.7.1 - Component variants

#### **2.1.4 Form Management**

- **React Hook Form 7.63.0**

  - Performant form handling
  - Uncontrolled inputs
  - Built-in validation
  - Integration with Yup schema validation

- **Yup 1.7.1**
  - Schema-based validation
  - Async validation support
  - Custom error messages
  - Integration with @hookform/resolvers 5.2.2

#### **2.1.5 HTTP Client & API**

- **Axios 1.12.2**
  - Promise-based HTTP requests
  - Request/response interceptors
  - Automatic token attachment
  - Error handling middleware
  - Base URL configuration

#### **2.1.6 Payment Integration**

- **Stripe Elements**
  - @stripe/stripe-js 8.2.0
  - @stripe/react-stripe-js 5.2.0
  - Embedded payment forms
  - PCI-compliant card handling
  - FPX and GrabPay support

#### **2.1.7 Data Visualization**

- **Recharts 3.4.1**
  - Line charts for sales trends
  - Bar charts for category performance
  - Pie charts for distribution
  - Responsive charts
  - Custom tooltips and legends

#### **2.1.8 Utility & Helper Libraries**

- **date-fns 3.6.0** - Date formatting and manipulation
- **fuse.js 7.1.0** - Fuzzy search on client-side
- **react-modal 3.16.3** - Accessible modal dialogs

#### **2.1.9 Build Tools**

- **React Scripts 5.0.1** (Create React App)
- **Vite 7.1.7** (Alternative bundler configured)
- **@vitejs/plugin-react 5.0.3**
- **Babel** (via React Scripts)
- **Webpack 5** (via React Scripts)

#### **2.1.10 Development Tools**

- **ESLint 8.57.1**
  - eslint-plugin-react 7.37.5
  - eslint-plugin-react-hooks 5.2.0
  - eslint-plugin-react-refresh 0.4.21
- **Prettier 3.6.2** - Code formatting
- **Testing Library**
  - @testing-library/react 16.3.0
  - @testing-library/jest-dom 6.8.0
  - @testing-library/user-event 14.6.1

### 2.2 Backend Technologies

#### **2.2.1 Runtime & Framework**

- **Node.js** (Version not explicitly specified, likely v18+ based on package compatibility)
- **Express 5.1.0**
  - Express v5 features (updated req.get() behavior)
  - Async route handler support
  - Improved error handling

#### **2.2.2 Database & ODM**

- **MongoDB** (via Mongoose)
  - NoSQL document database
  - MongoDB Atlas cloud hosting (production)
  - Local MongoDB for development
- **Mongoose 8.16.4**
  - Schema definitions with validation
  - Middleware (pre/post hooks)
  - Virtual properties
  - Static and instance methods
  - Text search indexes
  - Compound indexes for performance
  - Schema-based TypeScript-like validation

#### **2.2.3 Authentication & Security**

- **jsonwebtoken (JWT) 9.0.2**

  - Access token generation (15-minute expiry)
  - Refresh token generation (7-day expiry)
  - Token verification with issuer/audience claims
  - Token type validation

- **bcryptjs 3.0.2**

  - Password hashing with 12 salt rounds
  - Async hashing for performance
  - Secure password comparison
  - Timing attack mitigation

- **Security Middleware**
  - **helmet 8.1.0** - Security headers
  - **cors 2.8.5** - Cross-Origin Resource Sharing
  - **express-mongo-sanitize 2.2.0** - NoSQL injection prevention
  - **express-rate-limit 8.0.1** - Rate limiting
  - **express-slow-down 3.0.0** - Speed limiting
  - **hpp 0.2.3** - HTTP Parameter Pollution prevention
  - **xss-clean 0.1.4** - XSS attack prevention
  - **cookie-parser 1.4.7** - Cookie parsing

#### **2.2.4 Validation & Sanitization**

- **express-validator 7.2.1**

  - Request body validation
  - Query parameter validation
  - Route parameter validation
  - Custom validators
  - Sanitization chains

- **sanitize-html 2.17.0**
  - HTML sanitization
  - XSS prevention
  - Whitelist approach

#### **2.2.5 Payment Processing**

- **Stripe 19.1.0**

  - Payment Intent API
  - Stripe Connect (for marketplace)
  - Webhook handling
  - Payment method management
  - FPX, Cards, GrabPay support

- **Stripe Frontend**
  - @stripe/react-stripe-js 5.2.0
  - @stripe/stripe-js 8.1.0

#### **2.2.6 File Upload & Storage**

- **multer 2.0.2** - Multipart form data parsing
- **multer-s3 3.0.1** - Direct S3 upload from Multer
- **sharp 0.34.4** - Image processing and optimization
- **AWS SDK**
  - aws-sdk 2.1692.0 (v2 SDK)
  - @aws-sdk/client-s3 3.913.0 (v3 SDK for S3)
  - @aws-sdk/s3-request-presigner 3.913.0

#### **2.2.7 Email Service** (Configured but not fully implemented)

- **nodemailer 7.0.6**
  - Email sending
  - HTML template support
  - AWS SES transport (planned)

#### **2.2.8 Logging & Monitoring**

- **winston 3.17.0**

  - Structured logging
  - Multiple log levels (error, warn, info, debug)
  - File transport with rotation
  - Console transport
  - JSON format logging

- **winston-daily-rotate-file 5.0.0**

  - Automatic log rotation
  - Date-based filenames
  - Size-based rotation
  - Old log cleanup

- **morgan 1.10.1**
  - HTTP request logging
  - Custom token support
  - Integration with Winston

#### **2.2.9 Background Jobs**

- **node-cron 4.2.1**
  - Scheduled tasks
  - Analytics calculation (daily at midnight)
  - Session cleanup
  - Log rotation

#### **2.2.10 Utility Libraries**

- **dotenv 17.2.1** - Environment variable management
- **compression 1.8.1** - Response compression (gzip)
- **chalk 5.6.0** - Terminal string styling
- **colors 1.4.0** - Console output coloring

#### **2.2.11 Testing Framework**

- **Jest 30.0.5**

  - Unit testing
  - Integration testing
  - Test coverage reports
  - Mock functions

- **Supertest 7.1.4**

  - HTTP assertion testing
  - API endpoint testing
  - Integration test support

- **mongodb-memory-server 10.1.4**

  - In-memory MongoDB for tests
  - Fast test execution
  - Isolated test environment

- **Testing Types**
  - @types/jest 30.0.0
  - @types/supertest 6.0.3
  - @types/node 24.1.0

#### **2.2.12 Development Tools**

- **nodemon 3.1.10** - Auto-restart on file changes
- **crypto 1.0.1** - Cryptographic utilities

### 2.3 Database Schema Overview

**Collections (9 main collections)**:

1. **users** - User accounts, profiles, addresses, merchant details
2. **listings** - Products and services with seller information
3. **carts** - Shopping cart items per user
4. **wishlists** - Saved items per user
5. **orders** - Completed purchase orders
6. **checkoutsessions** - Active checkout sessions with expiry
7. **merchantanalytics** - Per-merchant sales analytics
8. **platformanalytics** - Platform-wide admin analytics
9. **sessionlogs** (if implemented) - User activity tracking

### 2.4 Environment Configuration

**Required Environment Variables**:

```bash
# Server
NODE_ENV=development|production
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce-dev

# JWT
JWT_ACCESS_SECRET=<32+ character secret>
JWT_REFRESH_SECRET=<32+ character secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ISSUER=ecommerce-app
JWT_AUDIENCE=ecommerce-users

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# Logging
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MINIMUM_AMOUNT=10.00
STRIPE_MINIMUM_AMOUNT_CENTS=1000
STRIPE_PLATFORM_FEE_PERCENTAGE=5
CLIENT_URL=http://localhost:3000

# AWS (Planned)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...
```

### 2.5 Development Workflow

**Git Workflow**:

- **Commit Convention**: Conventional Commits with Commitizen
- **Commit Linting**: @commitlint/cli with conventional config
- **Git Hooks**: Husky for pre-commit/commit-msg hooks
- **Branch Strategy**: Main branch for production

**Scripts Available**:

**Client** (Frontend):

```bash
npm start          # Start development server (port 3000)
npm run build      # Production build
npm test           # Run tests
npm run eject      # Eject from CRA (not recommended)
```

**Server** (Backend):

```bash
npm start          # Production start
npm run dev        # Development with nodemon
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report
npm run db:seed    # Seed database with test data
npm run logs       # View logs
npm run env:check  # Validate environment variables
npm run health:check      # Server health check
```

### 2.6 API Architecture

**Base URL Structure**:

- Development: `http://localhost:5000/api`
- Production: `https://api.yourdomain.com/api`

**API Versioning**: Not implemented (implicit v1)

**Route Groups**:

- `/api/auth` - Authentication (login, register, refresh, logout)
- `/api/users` - User profile management
- `/api/addresses` - Address CRUD operations
- `/api/merchants` - Merchant account management
- `/api/listings` - Product/service listing CRUD
- `/api/cart` - Shopping cart operations
- `/api/wishlist` - Wishlist operations
- `/api/checkout` - Checkout session management
- `/api/orders` - Order management and history
- `/api/upload` - Image upload to S3
- `/api/analytics` - Merchant and platform analytics
- `/api/health` - Server health check

**Response Format**:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Format**:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [],
  "stack": "..." // Development only
}
```

---

**END OF PART 1**

This document provides the foundational overview of the system. Continue to Part 2 for detailed architecture breakdown.
