# Authentication & User Management

> User registration, login, password management, and session handling

[← Back to Features Index](./README.md)

---

## Overview

The authentication system provides secure user registration, login, and session management for the UiTM Marketplace platform. It supports multiple user roles and integrates UiTM-specific validation requirements.

## Table of Contents

- [1.1 User Registration](#11-user-registration)
- [1.2 User Login](#12-user-login)
- [1.3 Password Management](#13-password-management)
- [1.4 Session Management](#14-session-management)

---

## 1.1 User Registration

**Purpose:** Allow new users to create accounts with UiTM email validation

**Page:** `/auth/register`

### Key Features

| Feature               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| UiTM Email Validation | Must end with `@uitm.edu.my`                           |
| Password Strength     | 8-24 chars, uppercase, lowercase, number, special char |
| Auto Username         | Generated from email prefix                            |
| Campus Selection      | Shah Alam, Puncak Alam, etc.                           |
| Phone Validation      | Malaysian format (01X-XXXXXXX)                         |
| Role Selection        | Consumer (default), Merchant (optional)                |
| Real-time Feedback    | Inline validation messages                             |
| Duplicate Prevention  | Unique email, username, phone                          |

### User Capabilities

- Fill registration form with personal details
- Choose campus from dropdown
- Select faculty from available options
- Set secure password with strength indicator
- Agree to terms and conditions
- Submit registration
- Receive confirmation and redirect to login

### Form Fields

| Field            | Requirements | Validation                              |
| ---------------- | ------------ | --------------------------------------- |
| Email            | Required     | UiTM domain only                        |
| Password         | Required     | 8-24 chars, mixed case, number, special |
| Confirm Password | Required     | Must match password                     |
| Phone Number     | Required     | Malaysian format                        |
| Campus           | Required     | Valid campus enum                       |
| Faculty          | Required     | Valid faculty enum                      |
| Role             | Optional     | Consumer or Merchant                    |

### Technical Implementation

```
Client-Side:
├── Form validation with react-hook-form
├── Real-time field validation
├── Password strength meter
└── Form state persistence

Server-Side:
├── express-validator middleware
├── bcrypt password hashing (12 salt rounds)
├── MongoDB uniqueness checks
├── Automatic timestamp creation
└── Response standardization
```

### Security Measures

| Measure            | Implementation               |
| ------------------ | ---------------------------- |
| Data Encryption    | HTTPS for all transmissions  |
| Password Storage   | bcrypt hash, never plaintext |
| Email Verification | Token generation (future)    |
| Rate Limiting      | Prevents registration abuse  |
| Input Sanitization | XSS prevention               |

---

## 1.2 User Login

**Purpose:** Authenticate existing users and establish secure session

**Page:** `/auth/login`

### Key Features

| Feature               | Description                        |
| --------------------- | ---------------------------------- |
| Email/Password Auth   | Standard credential authentication |
| Remember Me           | Extended session duration          |
| Dual-Token Strategy   | Access token + refresh token       |
| Auto Session Restore  | Seamless page reload experience    |
| Smart Redirect        | Returns to intended destination    |
| Token Expiration      | Automatic refresh handling         |
| Secure Cookie Storage | HTTP-only refresh tokens           |

### User Capabilities

- Enter email and password
- Choose to stay logged in ("Remember me")
- See helpful error messages
- Reset password (if forgotten)
- Be redirected to intended destination after login
- Access role-specific features immediately

### User Gains After Login

| Gain                    | Description                              |
| ----------------------- | ---------------------------------------- |
| Personalized Experience | Saved preferences and history            |
| Cart & Wishlist         | Persistent shopping data                 |
| Purchase Ability        | Can complete transactions                |
| Order History           | View past orders                         |
| Profile Customization   | Edit personal info                       |
| Role Features           | Access merchant dashboard or admin panel |

### Token Strategy

```
Access Token:
├── Lifetime: 30 minutes
├── Storage: Memory (Redux state)
├── Usage: API authorization header
└── Refresh: Auto-refresh on 401

Refresh Token:
├── Lifetime: 7 days
├── Storage: HTTP-only cookie
├── Usage: Obtain new access token
└── Security: Rotation on each use
```

### Technical Implementation

```
Authentication Flow:
1. User submits credentials
2. Server validates against database
3. bcrypt compares password hash
4. Generate access + refresh tokens
5. Set refresh token in HTTP-only cookie
6. Return access token in response
7. Client stores access token in Redux
8. Axios interceptor attaches to requests
```

### Security Measures

| Measure                  | Implementation                  |
| ------------------------ | ------------------------------- |
| Password Comparison      | bcrypt constant-time comparison |
| Timing Attack Prevention | Constant-time operations        |
| Rate Limiting            | 5 attempts per 15 minutes       |
| IP Tracking              | Suspicious activity monitoring  |
| Cookie Flags             | httpOnly, secure, sameSite      |
| Token Invalidation       | Blacklist on logout             |

---

## 1.3 Password Management

**Purpose:** Allow users to recover and reset forgotten passwords

**Pages:** `/auth/forgot-password`, `/auth/reset-password`

### Key Features

| Feature             | Description                                |
| ------------------- | ------------------------------------------ |
| Email Reset         | Secure link sent to registered email       |
| Token Generation    | Cryptographically secure random tokens     |
| Token Expiration    | 15-minute validity                         |
| Password Validation | Same strength requirements as registration |
| Confirmation Email  | Success notification after reset           |

### User Flow

```
Forgot Password Flow:
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Enter Email    │────▶│  Receive Email   │────▶│  Click Link     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Login Success  │◀────│  Confirmation    │◀────│  Set New Pass   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### User Capabilities

- Request password reset via email
- Receive reset link in inbox
- Set new password with validation
- Confirm password reset
- Login with new credentials

### Technical Implementation

| Component           | Details                      |
| ------------------- | ---------------------------- |
| Token Generation    | crypto.randomBytes(32)       |
| Token Storage       | Hashed before saving to DB   |
| Email Service       | Nodemailer integration       |
| Expiration Tracking | Token timestamp validation   |
| Rate Limiting       | Prevents reset request abuse |

---

## 1.4 Session Management

**Purpose:** Maintain user authentication across browser sessions

### Key Features

| Feature          | Description                    |
| ---------------- | ------------------------------ |
| Auto Restoration | Session restored on page load  |
| Token Refresh    | Automatic before expiration    |
| Multi-Device     | Support simultaneous sessions  |
| Logout All       | Invalidate all active sessions |
| Timeout Handling | Graceful session expiration    |
| Idle Detection   | Warn before auto-logout        |

### User Capabilities

- Stay logged in across browser sessions
- Use multiple devices simultaneously
- Manually logout from current session
- See session expiration warnings
- Refresh session without re-login
- Logout from all devices (security option)

### Session States

```
Session Lifecycle:
┌────────────┐
│   Guest    │
└─────┬──────┘
      │ Login
      ▼
┌────────────┐     Token Refresh     ┌────────────┐
│   Active   │◀─────────────────────▶│   Active   │
└─────┬──────┘                       └────────────┘
      │ Logout/Expire
      ▼
┌────────────┐
│   Guest    │
└────────────┘
```

### Technical Implementation

| Component          | Technology                    |
| ------------------ | ----------------------------- |
| Client State       | Redux Persist                 |
| Cookie Storage     | HTTP-only cookies             |
| Token Refresh      | Axios interceptor             |
| Session Validation | Middleware on critical routes |
| Token Rotation     | New refresh token on each use |

### Security Features

| Feature          | Purpose                             |
| ---------------- | ----------------------------------- |
| Token Rotation   | Prevent token reuse attacks         |
| Secure Cookies   | XSS protection                      |
| Session Binding  | IP/device fingerprinting (optional) |
| Activity Logging | Audit trail for sessions            |

---

## API Endpoints

| Method | Endpoint                    | Description                 |
| ------ | --------------------------- | --------------------------- |
| `POST` | `/api/auth/register`        | Create new user account     |
| `POST` | `/api/auth/login`           | Authenticate user           |
| `POST` | `/api/auth/logout`          | End current session         |
| `POST` | `/api/auth/refresh`         | Get new access token        |
| `POST` | `/api/auth/forgot-password` | Request password reset      |
| `POST` | `/api/auth/reset-password`  | Set new password            |
| `GET`  | `/api/auth/me`              | Get current user info       |
| `POST` | `/api/auth/verify-email`    | Verify email token (future) |

---

## Error Handling

| Error Code | Scenario            | User Message                          |
| ---------- | ------------------- | ------------------------------------- |
| `AUTH_001` | Invalid credentials | "Invalid email or password"           |
| `AUTH_002` | Account suspended   | "Your account has been suspended"     |
| `AUTH_003` | Token expired       | "Session expired, please login again" |
| `AUTH_004` | Rate limited        | "Too many attempts, try again later"  |
| `AUTH_005` | Email not found     | "No account found with this email"    |
| `AUTH_006` | Reset token invalid | "Reset link is invalid or expired"    |

---

## Related Files

### Client-Side

- `client/src/features/auth/` - Auth feature components
- `client/src/store/slices/authSlice.js` - Redux state management
- `client/src/services/authService.js` - API calls
- `client/src/contexts/AuthContext.js` - Auth context provider

### Server-Side

- `server/controllers/user/` - Auth controllers
- `server/middleware/auth.middleware.js` - Auth middleware
- `server/models/User.js` - User model
- `server/validators/auth.validator.js` - Validation rules

---

[← Back to Features Index](./README.md) | [Next: Home & Discovery →](./02-discovery.md)
