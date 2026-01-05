# Merchant Features

> Merchant dashboard, shop management, and verification

[← Back to Features Index](./README.md)

---

## Overview

The merchant features module provides tools for sellers to manage their business, including a comprehensive dashboard, shop customization, and verification processes.

## Table of Contents

- [8.1 Merchant Dashboard](#81-merchant-dashboard)
- [8.2 Shop Management](#82-shop-management)
- [8.3 Merchant Verification](#83-merchant-verification)

---

## 8.1 Merchant Dashboard

**Purpose:** Central hub for merchant operations

**Page:** `/merchant/dashboard`

**Access:** Merchant role required

### Key Features

| Feature             | Description                |
| ------------------- | -------------------------- |
| Analytics Overview  | Key business metrics       |
| Quick Statistics    | At-a-glance numbers        |
| Revenue Charts      | Visual sales data          |
| Sales Trends        | Performance over time      |
| Order Management    | Pending order alerts       |
| Performance Metrics | Business health indicators |
| Quick Actions       | Common tasks shortcuts     |
| Recent Activity     | Latest order activity      |

### Dashboard Metrics

| Metric              | Description                 |
| ------------------- | --------------------------- |
| Total Revenue       | All-time earnings           |
| Total Sales         | Completed order count       |
| Average Order Value | Revenue / Sales             |
| Active Listings     | Published products/services |
| Pending Orders      | Awaiting action             |
| Low Stock Items     | Inventory alerts            |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Welcome back, Shop ABC! 👋                                       │
├─────────────────────────────────────────────────────────────────┤
│ KEY METRICS                                                      │
│ ┌───────────────┬───────────────┬───────────────┬─────────────┐ │
│ │ Total Revenue │ Total Sales   │ Avg. Order    │ Listings    │ │
│ │ RM 85,420     │ 850           │ RM 100.49     │ 45 active   │ │
│ │ ↑ 12% vs last │ ↑ 8% vs last  │ ↑ 3% vs last  │ 5 inactive  │ │
│ │ month         │ month         │ month         │             │ │
│ └───────────────┴───────────────┴───────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┬─────────────────────────────────┐
│ │ REVENUE TREND               │ ORDER STATUS                    │
│ │                             │                                 │
│ │     📈 [Line Chart]         │     🥧 [Pie Chart]              │
│ │                             │     ● Pending: 3                │
│ │     Jan Feb Mar Apr May     │     ● Confirmed: 5              │
│ │                             │     ● Shipped: 12               │
│ │                             │     ● Completed: 830            │
│ └─────────────────────────────┴─────────────────────────────────┘
├─────────────────────────────────────────────────────────────────┤
│ ⚠️ ALERTS                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔴 3 pending orders need attention                          │ │
│ │ 🟡 5 products have low stock                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                                    │
│ [+ Create Listing] [📦 View Orders] [🏪 Manage Shop] [📊 Analytics]
├─────────────────────────────────────────────────────────────────┤
│ RECENT ORDERS                                                    │
│ ┌────────────────┬──────────┬─────────────┬──────────┬────────┐ │
│ │ Order ID       │ Customer │ Amount      │ Status   │ Action │ │
│ ├────────────────┼──────────┼─────────────┼──────────┼────────┤ │
│ │ #ORD-2026-001  │ John D.  │ RM 85.00    │ Pending  │ [View] │ │
│ │ #ORD-2026-002  │ Jane S.  │ RM 120.00   │ Confirmed│ [View] │ │
│ │ #ORD-2026-003  │ Bob W.   │ RM 45.00    │ Shipped  │ [View] │ │
│ └────────────────┴──────────┴─────────────┴──────────┴────────┘ │
│                                             [View All Orders →] │
└─────────────────────────────────────────────────────────────────┘
```

### Time Period Filters

| Period     | Description       |
| ---------- | ----------------- |
| Today      | Current day stats |
| This Week  | Last 7 days       |
| This Month | Last 30 days      |
| This Year  | Year to date      |
| All Time   | Total lifetime    |

### Growth Indicators

| Indicator | Display                 |
| --------- | ----------------------- |
| Positive  | ↑ Green with percentage |
| Negative  | ↓ Red with percentage   |
| Neutral   | — Gray, no change       |

### Technical Implementation

| Feature    | Implementation              |
| ---------- | --------------------------- |
| Analytics  | Pre-calculated aggregations |
| Scheduling | 15-minute refresh jobs      |
| Caching    | Redis for dashboard data    |
| Real-time  | WebSocket for order alerts  |
| Charts     | Chart.js / Recharts         |
| Export     | CSV/PDF generation          |
| Responsive | Mobile-friendly layout      |

---

## 8.2 Shop Management

**Purpose:** Manage merchant shop settings and branding

**Page:** `/merchant/store`

**Access:** Merchant role required

### Key Features

| Feature             | Description            |
| ------------------- | ---------------------- |
| Shop Info Editing   | Name and description   |
| Branding Upload     | Logo and banner images |
| Shop Description    | About the shop text    |
| Slug Customization  | Custom shop URL        |
| Statistics Display  | Shop performance       |
| Verification Status | Trust badge display    |
| Shop Preview        | Public page preview    |
| SEO Settings        | Meta information       |

### User Capabilities

- Edit shop name
- Update shop description
- Upload shop logo
- Upload shop banner
- Customize shop URL slug
- View shop statistics
- See verification status
- Preview public shop page
- Manage shop settings
- Request verification (future)

### Shop Settings Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Shop Settings                                  [👁️ Preview Shop] │
├─────────────────────────────────────────────────────────────────┤
│ SHOP BRANDING                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Banner Image (1200×300)                                     │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │                                                         │ │ │
│ │ │              [Current Banner Image]                     │ │ │
│ │ │                                                         │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                              [📷 Upload Banner] [🗑️ Remove] │ │
│ │                                                             │ │
│ │ Shop Logo (200×200)                                         │ │
│ │ ┌──────────┐                                                │ │
│ │ │          │                                                │ │
│ │ │  [Logo]  │  [📷 Upload Logo] [🗑️ Remove]                  │ │
│ │ │          │                                                │ │
│ │ └──────────┘                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SHOP INFORMATION                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Shop Name *                                                 │ │
│ │ [ABC Electronics_______________________________________]    │ │
│ │                                                             │ │
│ │ Shop Description                                            │ │
│ │ [Your one-stop shop for quality electronics and gadgets.   │ │
│ │  We specialize in affordable tech for students...         ]│ │
│ │ 156/500 characters                                          │ │
│ │                                                             │ │
│ │ Shop URL                                                    │ │
│ │ uitm-marketplace.com/merchants/[abc-electronics____]       │ │
│ │ ✓ Available                                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SHOP STATISTICS                                                  │
│ ┌───────────────┬───────────────┬───────────────┬─────────────┐ │
│ │ Total         │ Total         │ Total         │ Average     │ │
│ │ Products      │ Sales         │ Revenue       │ Rating      │ │
│ │ 45            │ 850           │ RM 85,420     │ ★★★★☆ 4.5   │ │
│ └───────────────┴───────────────┴───────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ VERIFICATION STATUS                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⏳ Not Verified                                              │ │
│ │ Verified merchants get a trust badge on their shop          │ │
│ │                                        [Request Verification]│ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                              [Cancel Changes] [Save Changes]    │
└─────────────────────────────────────────────────────────────────┘
```

### Image Specifications

| Image  | Dimensions  | Max Size | Formats        |
| ------ | ----------- | -------- | -------------- |
| Logo   | 200×200 px  | 2 MB     | JPG, PNG, WebP |
| Banner | 1200×300 px | 5 MB     | JPG, PNG, WebP |

### Shop Slug Rules

| Rule          | Description                      |
| ------------- | -------------------------------- |
| Characters    | Lowercase alphanumeric + hyphens |
| Length        | 3-30 characters                  |
| Uniqueness    | Must be unique across platform   |
| Auto-generate | Created from shop name           |
| Customizable  | User can modify                  |

### Validations

| Field       | Validation                   |
| ----------- | ---------------------------- |
| Shop Name   | 3-50 characters, required    |
| Description | Max 500 characters           |
| Slug        | 3-30 chars, unique, URL-safe |
| Logo        | Square aspect ratio          |
| Banner      | 4:1 aspect ratio             |

### Technical Implementation

| Feature       | Implementation                       |
| ------------- | ------------------------------------ |
| Auto-Creation | Shop created on first merchant visit |
| Pre-fill      | Profile data used for defaults       |
| Image Upload  | S3 with CDN                          |
| Slug Check    | Real-time availability API           |
| Live Preview  | Instant preview updates              |
| Analytics     | Shop visitor tracking                |
| SEO           | Meta tags generation                 |

---

## 8.3 Merchant Verification

**Purpose:** Verify merchant legitimacy and build trust

**Status:** 🚧 Future Enhancement

### Planned Features

| Feature               | Description          | Status  |
| --------------------- | -------------------- | ------- |
| Document Upload       | ID/Business docs     | Planned |
| Business Registration | Company number       | Planned |
| Identity Verification | KYC process          | Planned |
| Bank Account          | Payment verification | Planned |
| Review Process        | Admin approval       | Planned |
| Verification Badge    | Trust indicator      | Planned |

### Verification Benefits

| Benefit           | Description          |
| ----------------- | -------------------- |
| Trust Badge       | ✓ Verified on shop   |
| Higher Visibility | Priority in search   |
| Higher Limits     | Increased COD limits |
| Premium Features  | Advanced analytics   |
| Customer Trust    | Improved conversion  |

### Planned Verification Flow

```
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Submit        │──▶│ Admin         │──▶│ Verified      │
│ Documents     │   │ Review        │   │ Status        │
└───────────────┘   └───────────────┘   └───────────────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
  Upload docs         Pending review      Badge displayed
  Wait for review     1-3 business days   Benefits active
```

### Required Documents (Planned)

| Document       | Purpose                |
| -------------- | ---------------------- |
| IC (MyKad)     | Identity verification  |
| Student ID     | UiTM affiliation       |
| Bank Statement | Financial verification |
| Business Cert  | If registered business |

### Verification Statuses

| Status       | Display | Description          |
| ------------ | ------- | -------------------- |
| Not Verified | ⏳      | Default state        |
| Pending      | 🔄      | Under review         |
| Verified     | ✓       | Approved             |
| Rejected     | ❌      | Declined with reason |

---

## API Endpoints

| Method   | Endpoint                            | Description             |
| -------- | ----------------------------------- | ----------------------- |
| `GET`    | `/api/merchant/dashboard`           | Get dashboard data      |
| `GET`    | `/api/merchant/shop`                | Get shop settings       |
| `PATCH`  | `/api/merchant/shop`                | Update shop settings    |
| `POST`   | `/api/merchant/shop/logo`           | Upload shop logo        |
| `POST`   | `/api/merchant/shop/banner`         | Upload shop banner      |
| `DELETE` | `/api/merchant/shop/logo`           | Remove logo             |
| `DELETE` | `/api/merchant/shop/banner`         | Remove banner           |
| `GET`    | `/api/merchant/shop/slug-available` | Check slug availability |
| `POST`   | `/api/merchant/verification`        | Submit verification     |
| `GET`    | `/api/merchant/verification`        | Get verification status |

---

## Related Files

### Client-Side

- `client/src/pages/merchant/Dashboard.js` - Dashboard page
- `client/src/pages/merchant/Store.js` - Shop management
- `client/src/components/merchant/` - Merchant components
- `client/src/store/slices/merchantSlice.js` - Merchant state

### Server-Side

- `server/controllers/admin/merchant.controller.js` - Merchant controllers
- `server/models/Shop.js` - Shop model
- `server/services/analytics.service.js` - Analytics calculations
- `server/jobs/analytics.job.js` - Scheduled aggregations

---

[← Previous: Profile Management](./07-profile-management.md) | [Back to Index](./README.md) | [Next: Analytics →](./09-analytics.md)
