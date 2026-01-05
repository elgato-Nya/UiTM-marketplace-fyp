# Cross-Cutting Concerns

> Security, responsive design, accessibility, performance, and state management

[← Back to Features Index](./README.md)

---

## Overview

Cross-cutting concerns are aspects that affect the entire application and are implemented consistently across all features and modules.

## Table of Contents

- [Security Features](#security-features)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Performance Optimizations](#performance-optimizations)
- [State Management](#state-management)
- [Analytics & Tracking](#analytics--tracking)

---

## Security Features

### Authentication & Authorization

| Feature                  | Implementation                  |
| ------------------------ | ------------------------------- |
| JWT Authentication       | Access + refresh token strategy |
| Role-Based Access (RBAC) | Consumer, Merchant, Admin roles |
| Protected Routes         | Route guards on frontend        |
| Session Management       | Secure token handling           |
| Token Refresh            | Automatic refresh on expiry     |
| Logout All Devices       | Invalidate all sessions         |

### Token Security

```
Token Strategy:
┌─────────────────────────────────────────────────────────────────┐
│ ACCESS TOKEN                                                     │
│ ├── Lifetime: 30 minutes                                        │
│ ├── Storage: Memory (Redux)                                     │
│ ├── Usage: Authorization header                                 │
│ └── Refresh: Auto on 401 response                               │
├─────────────────────────────────────────────────────────────────┤
│ REFRESH TOKEN                                                    │
│ ├── Lifetime: 7 days                                            │
│ ├── Storage: HTTP-only cookie                                   │
│ ├── Usage: Obtain new access token                              │
│ └── Security: Rotated on each use                               │
└─────────────────────────────────────────────────────────────────┘
```

### Data Security

| Measure             | Implementation          |
| ------------------- | ----------------------- |
| HTTPS Encryption    | TLS for all traffic     |
| Password Hashing    | bcrypt (12 salt rounds) |
| Input Sanitization  | XSS prevention          |
| CSRF Protection     | Token-based protection  |
| SQL/NoSQL Injection | Parameterized queries   |
| Rate Limiting       | Request throttling      |

### Rate Limiting Configuration

| Endpoint       | Limit        | Window     |
| -------------- | ------------ | ---------- |
| Login          | 5 attempts   | 15 minutes |
| Registration   | 3 attempts   | 1 hour     |
| Password Reset | 3 attempts   | 1 hour     |
| API General    | 100 requests | 1 minute   |
| File Upload    | 10 uploads   | 1 hour     |

### Security Headers (Helmet)

| Header                    | Purpose               |
| ------------------------- | --------------------- |
| Content-Security-Policy   | Prevent XSS           |
| X-Frame-Options           | Prevent clickjacking  |
| X-Content-Type-Options    | Prevent MIME sniffing |
| Strict-Transport-Security | Force HTTPS           |
| X-XSS-Protection          | XSS filter            |

### File Security

| Measure              | Implementation             |
| -------------------- | -------------------------- |
| File Type Validation | Whitelist extensions       |
| File Size Limits     | Max upload sizes           |
| Virus Scanning       | Planned enhancement        |
| Secure Storage       | AWS S3 with ACL            |
| Access Control       | Pre-signed URLs            |
| Image Optimization   | Compression before storage |

### Payment Security

| Measure                | Implementation    |
| ---------------------- | ----------------- |
| PCI DSS Compliance     | Via Stripe        |
| Secure Processing      | Stripe SDK        |
| No Card Storage        | Tokenization only |
| 3D Secure              | Additional auth   |
| Transaction Encryption | TLS               |
| Fraud Detection        | Stripe Radar      |

---

## Responsive Design

### Breakpoints

| Name | Width       | Devices                     |
| ---- | ----------- | --------------------------- |
| xs   | 0-599px     | Mobile phones               |
| sm   | 600-899px   | Large phones, small tablets |
| md   | 900-1199px  | Tablets                     |
| lg   | 1200-1535px | Laptops, desktops           |
| xl   | 1536px+     | Large screens               |

### Device Support

| Device Type  | Optimization                       |
| ------------ | ---------------------------------- |
| Mobile       | Touch-optimized, bottom navigation |
| Tablet       | Adaptive layouts                   |
| Desktop      | Full feature access                |
| Large Screen | Expanded layouts                   |

### Responsive Features

| Feature    | Mobile      | Tablet      | Desktop     |
| ---------- | ----------- | ----------- | ----------- |
| Navigation | Bottom bar  | Sidebar     | Top navbar  |
| Filters    | Modal       | Collapsible | Sidebar     |
| Grid       | 1-2 columns | 2-3 columns | 3-4 columns |
| Cards      | Stacked     | Grid        | Grid        |
| Modals     | Full screen | Centered    | Centered    |
| Tables     | Scrollable  | Responsive  | Full        |

### Mobile-First Design

```
Layout Adaptation:
┌─────────────────┐   ┌───────────────────────┐   ┌─────────────────────────────┐
│     MOBILE      │   │       TABLET          │   │         DESKTOP             │
├─────────────────┤   ├───────────────────────┤   ├─────────────────────────────┤
│ ┌─────────────┐ │   │ ┌─────┐ ┌─────────┐   │   │ ┌────┐ ┌───────────────────┐│
│ │   Header    │ │   │ │ Nav │ │ Content │   │   │ │Nav │ │     Content       ││
│ ├─────────────┤ │   │ │     │ │         │   │   │ │    │ │                   ││
│ │             │ │   │ │     │ │         │   │   │ │    │ │                   ││
│ │   Content   │ │   │ │     │ │         │   │   │ │    │ │                   ││
│ │             │ │   │ │     │ │         │   │   │ │    │ │                   ││
│ ├─────────────┤ │   │ │     │ │         │   │   │ │    │ │                   ││
│ │ Bottom Nav  │ │   │ └─────┘ └─────────┘   │   │ └────┘ └───────────────────┘│
│ └─────────────┘ │   └───────────────────────┘   └─────────────────────────────┘
└─────────────────┘
```

### Touch Optimizations

| Element  | Touch Target        |
| -------- | ------------------- |
| Buttons  | Min 44×44px         |
| Links    | Adequate padding    |
| Inputs   | Large touch areas   |
| Gestures | Swipe support       |
| Feedback | Visual touch states |

---

## Accessibility

### WCAG 2.1 AA Compliance

| Guideline      | Implementation             |
| -------------- | -------------------------- |
| Perceivable    | Alt text, color contrast   |
| Operable       | Keyboard navigation, focus |
| Understandable | Clear labels, errors       |
| Robust         | Semantic HTML, ARIA        |

### Semantic HTML

```html
<!-- Example: Proper structure -->
<main>
  <header>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <article>
    <h1>Page Title</h1>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section</h2>
      ...
    </section>
  </article>
  <aside aria-label="Filters">...</aside>
  <footer>...</footer>
</main>
```

### ARIA Implementation

| Pattern    | ARIA Usage                        |
| ---------- | --------------------------------- |
| Navigation | `aria-label`, `aria-current`      |
| Modals     | `role="dialog"`, `aria-modal`     |
| Alerts     | `role="alert"`, `aria-live`       |
| Forms      | `aria-required`, `aria-invalid`   |
| Loading    | `aria-busy`, `aria-live`          |
| Tabs       | `role="tablist"`, `aria-selected` |

### Keyboard Navigation

| Key        | Action                 |
| ---------- | ---------------------- |
| Tab        | Move to next element   |
| Shift+Tab  | Move to previous       |
| Enter      | Activate button/link   |
| Space      | Toggle checkbox/button |
| Escape     | Close modal/dropdown   |
| Arrow Keys | Navigate lists/menus   |

### Focus Management

| Scenario        | Behavior                |
| --------------- | ----------------------- |
| Modal Open      | Focus trapped in modal  |
| Modal Close     | Return focus to trigger |
| Page Navigation | Focus to main content   |
| Form Errors     | Focus to first error    |
| Dynamic Content | Announce changes        |

### Color & Contrast

| Element          | Requirement          |
| ---------------- | -------------------- |
| Text             | 4.5:1 contrast ratio |
| Large Text       | 3:1 contrast ratio   |
| UI Components    | 3:1 contrast ratio   |
| Focus Indicators | Visible outline      |

### Form Accessibility

```html
<!-- Accessible form example -->
<form>
  <div>
    <label for="email">Email Address *</label>
    <input
      id="email"
      type="email"
      aria-required="true"
      aria-describedby="email-hint email-error"
    />
    <span id="email-hint">Enter your UiTM email</span>
    <span id="email-error" role="alert">
      <!-- Error message appears here -->
    </span>
  </div>
</form>
```

---

## Performance Optimizations

### Client-Side Optimizations

| Technique          | Implementation              |
| ------------------ | --------------------------- |
| Code Splitting     | React.lazy, dynamic imports |
| Lazy Loading       | Images, components          |
| Image Optimization | WebP, responsive sizes      |
| Bundle Size        | Tree shaking, minification  |
| Caching            | Service workers (future)    |
| Memoization        | useMemo, useCallback        |

### Image Optimization

| Technique         | Benefit           |
| ----------------- | ----------------- |
| WebP Format       | 25-35% smaller    |
| Responsive Images | Appropriate sizes |
| Lazy Loading      | Deferred loading  |
| CDN Delivery      | Edge caching      |
| Compression       | Reduced file size |

### Bundle Optimization

```
Bundle Strategy:
├── vendor.js        → Third-party libraries
├── main.js          → Core application
├── auth.js          → Auth feature (lazy)
├── merchant.js      → Merchant feature (lazy)
├── admin.js         → Admin feature (lazy)
└── [page].js        → Page-specific chunks
```

### Server-Side Optimizations

| Technique          | Implementation        |
| ------------------ | --------------------- |
| Database Indexing  | Compound indexes      |
| Query Optimization | Efficient queries     |
| Redis Caching      | Hot data caching      |
| CDN                | Static asset delivery |
| Compression        | gzip/Brotli           |
| Connection Pooling | Database connections  |

### Database Indexes

| Collection | Indexes                            |
| ---------- | ---------------------------------- |
| Users      | email, username                    |
| Listings   | seller, category, price, createdAt |
| Orders     | buyer, seller, status, createdAt   |
| Cart       | user, items.listing                |

### Caching Strategy

| Cache   | Duration | Data                 |
| ------- | -------- | -------------------- |
| Redis   | 5-15 min | Analytics, counts    |
| Redis   | 1 hour   | Categories, featured |
| CDN     | 1 year   | Static assets        |
| Browser | Vary     | API responses        |

### Performance Metrics

| Metric                   | Target  |
| ------------------------ | ------- |
| First Contentful Paint   | < 1.5s  |
| Time to Interactive      | < 3s    |
| Largest Contentful Paint | < 2.5s  |
| Cumulative Layout Shift  | < 0.1   |
| First Input Delay        | < 100ms |

---

## State Management

### Redux Slices

| Slice      | Data Managed         |
| ---------- | -------------------- |
| `auth`     | User, tokens, roles  |
| `cart`     | Cart items, totals   |
| `wishlist` | Saved items          |
| `orders`   | Purchases, sales     |
| `listings` | Browse data, detail  |
| `checkout` | Session, payment     |
| `profile`  | User data, addresses |
| `merchant` | Shop, analytics      |
| `ui`       | Theme, notifications |

### State Structure

```javascript
store = {
  auth: {
    user: { id, email, username, roles, ... },
    accessToken: string,
    isAuthenticated: boolean,
    loading: boolean,
    error: object | null
  },
  cart: {
    items: [],
    subtotal: number,
    itemCount: number,
    loading: boolean
  },
  wishlist: {
    items: [],
    loading: boolean
  },
  // ... other slices
}
```

### Local Storage

| Key            | Data             | Purpose             |
| -------------- | ---------------- | ------------------- |
| theme          | 'light' / 'dark' | User preference     |
| recentSearches | string[]         | Search history      |
| recentlyViewed | listing IDs      | Browsing history    |
| draftListing   | form data        | Draft save          |
| language       | locale code      | Language preference |

### Redux Persist

| Slice    | Persisted           | Storage      |
| -------- | ------------------- | ------------ |
| auth     | Partial (user only) | localStorage |
| cart     | No                  | Server       |
| wishlist | No                  | Server       |
| ui       | Yes                 | localStorage |

---

## Analytics & Tracking

### User Analytics

| Event            | Data Captured        |
| ---------------- | -------------------- |
| Page View        | URL, timestamp, user |
| User Journey     | Navigation path      |
| Feature Usage    | Feature interactions |
| Conversion       | Purchase funnel      |
| Drop-off         | Abandonment points   |
| Session Duration | Time on platform     |

### Business Analytics

| Metric               | Description             |
| -------------------- | ----------------------- |
| GMV                  | Gross Merchandise Value |
| Revenue              | Platform earnings       |
| Conversion Rate      | Visitors to buyers      |
| Average Order Value  | Revenue per order       |
| Customer Acquisition | New customer cost       |
| Retention Rate       | Return customers        |

### Event Tracking

| Event              | Trigger             |
| ------------------ | ------------------- |
| `listing_view`     | View listing detail |
| `add_to_cart`      | Add item to cart    |
| `remove_from_cart` | Remove from cart    |
| `begin_checkout`   | Start checkout      |
| `purchase`         | Complete order      |
| `search`           | Perform search      |
| `filter_applied`   | Apply filter        |

### Analytics Implementation

```javascript
// Example tracking call
analytics.track("purchase", {
  orderId: "ORD-2026-001",
  total: 152.0,
  items: [
    { id: "item1", name: "Product A", price: 100, quantity: 1 },
    { id: "item2", name: "Product B", price: 50, quantity: 1 },
  ],
  paymentMethod: "stripe",
  deliveryMethod: "campus_pickup",
});
```

---

## Error Handling

### Client-Side Errors

| Error Type | Handling            |
| ---------- | ------------------- |
| API Errors | Toast notifications |
| Validation | Inline field errors |
| Network    | Retry with fallback |
| Auth       | Redirect to login   |
| Unknown    | Error boundary      |

### Error Boundary

```jsx
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error) => logError(error)}
>
  <App />
</ErrorBoundary>
```

### Server-Side Errors

| Error Type       | Response                |
| ---------------- | ----------------------- |
| Validation (400) | Field-specific errors   |
| Auth (401)       | Token refresh or logout |
| Forbidden (403)  | Access denied message   |
| Not Found (404)  | Resource not found      |
| Rate Limit (429) | Retry after header      |
| Server (500)     | Generic error, logged   |

### Error Response Format

```javascript
{
  success: false,
  error: {
    message: "User-friendly message",
    code: "ERROR_CODE",
    details: [...] // Validation errors
  }
}
```

---

## Logging

### Server Logging

| Level | Usage                      |
| ----- | -------------------------- |
| error | Errors requiring attention |
| warn  | Potential issues           |
| info  | General operations         |
| debug | Development details        |

### Log Structure

```javascript
{
  timestamp: "2026-01-01T10:30:00.000Z",
  level: "error",
  message: "Payment processing failed",
  metadata: {
    userId: "xxx",
    orderId: "xxx",
    error: {...}
  }
}
```

### Log Storage

| Type        | Storage       | Retention  |
| ----------- | ------------- | ---------- |
| Application | Daily files   | 30 days    |
| Access      | Daily files   | 7 days     |
| Error       | Separate file | 90 days    |
| Audit       | Database      | Indefinite |

---

## Related Files

### Security

- `server/config/helmet.config.js`
- `server/config/cors.config.js`
- `server/middleware/auth.middleware.js`
- `server/config/limiter.config.js`

### Frontend

- `client/src/store/` - Redux configuration
- `client/src/styles/` - Responsive styles
- `client/src/components/common/ErrorBoundary.js`
- `client/src/utils/` - Utility functions

### Performance

- `server/config/database.config.js`
- `client/webpack.config.js` (if applicable)
- `client/public/` - Static assets

---

[← Previous: Search & Notifications](./11-search-notifications.md) | [Back to Index](./README.md)
