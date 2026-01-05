# UiTM Marketplace - Feature Documentation

> Comprehensive guide to all platform features, modules, and capabilities

## 📚 Documentation Structure

This documentation is organized into separate modules for better readability and maintenance. Each module contains detailed information about specific platform features.

## 🗂️ Feature Modules

| #   | Module                                                     | Description                                             | Status         |
| --- | ---------------------------------------------------------- | ------------------------------------------------------- | -------------- |
| 01  | [Authentication & User Management](./01-authentication.md) | Registration, login, password management, sessions      | ✅ Implemented |
| 02  | [Home & Discovery](./02-discovery.md)                      | Home page, browse listings, detail pages, shop profiles | ✅ Implemented |
| 03  | [Listing Management](./03-listing-management.md)           | Create, edit, and manage product/service listings       | ✅ Implemented |
| 04  | [Shopping Experience](./04-shopping-experience.md)         | Shopping cart, wishlist functionality                   | ✅ Implemented |
| 05  | [Checkout & Payment](./05-checkout.md)                     | Multi-step checkout, Stripe integration, COD            | ✅ Implemented |
| 06  | [Order Management](./06-order-management.md)               | Buyer/seller order views, order lifecycle               | ✅ Implemented |
| 07  | [Profile Management](./07-profile-management.md)           | User profile, addresses, security settings              | ✅ Implemented |
| 08  | [Merchant Features](./08-merchant-features.md)             | Dashboard, shop management, verification                | ✅ Implemented |
| 09  | [Analytics Dashboard](./09-analytics.md)                   | Merchant analytics, platform analytics                  | ✅ Implemented |
| 10  | [Admin Panel](./10-admin-panel.md)                         | Platform administration and moderation                  | 🚧 Planned     |
| 11  | [Search & Notifications](./11-search-notifications.md)     | Global search, filtering, notification system           | ⚡ Partial     |
| 12  | [Cross-Cutting Concerns](./12-cross-cutting.md)            | Security, responsive design, accessibility, performance | ✅ Implemented |

## 🎯 Quick Reference

### User Roles

| Role         | Access Level | Key Features                                      |
| ------------ | ------------ | ------------------------------------------------- |
| **Consumer** | Basic        | Browse, cart, wishlist, purchase, profile         |
| **Merchant** | Extended     | All consumer features + listings, shop, analytics |
| **Admin**    | Full         | All features + platform management                |

### Key Pages Overview

```
/                          → Home page
/auth/login                → User login
/auth/register             → User registration
/browse                    → Browse all listings
/listings/:id              → Listing detail
/merchants/:slug           → Shop profile
/cart                      → Shopping cart
/wishlist                  → User wishlist
/checkout                  → Checkout process
/orders/purchases          → Buyer's orders
/profile                   → User profile
/merchant/dashboard        → Merchant dashboard
/merchant/listings         → Manage listings
/merchant/analytics        → Business analytics
/admin/dashboard           → Admin panel (planned)
```

### Technology Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Frontend       | React 18, Redux Toolkit, Material-UI |
| Backend        | Node.js, Express.js                  |
| Database       | MongoDB with Mongoose                |
| Authentication | JWT (access + refresh tokens)        |
| Payments       | Stripe                               |
| File Storage   | AWS S3                               |
| Caching        | Redis                                |

## 📖 How to Use This Documentation

1. **New to the project?** Start with [Authentication](./01-authentication.md) to understand user flows
2. **Building features?** Navigate to the relevant module document
3. **Need technical details?** Each module includes implementation notes
4. **Looking for API info?** Check the "Technical Implementation" sections

## 🔗 Related Documentation

- [Environment Setup](../ENVIRONMENT.md)
- [Security Guidelines](../SECURITY.md)
- [Testing Guide](../TESTING.md)
- [Rate Limiting](../RATE-LIMITING-EXPLAINED.md)
- [AWS Services](../AWS-SERVICES-IMPLEMENTATION.md)

---

**Legend:**

- ✅ Implemented - Feature is complete and in production
- ⚡ Partial - Core functionality implemented, enhancements planned
- 🚧 Planned - Feature designed but not yet implemented

---

_Last Updated: January 2026_  
_Platform Version: 1.0.0_  
_Documentation Maintained by: Development Team_
