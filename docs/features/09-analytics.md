# Analytics Dashboard

> Merchant analytics and platform-wide analytics

[← Back to Features Index](./README.md)

---

## Overview

The analytics module provides detailed business insights for merchants and platform-wide analytics for administrators, enabling data-driven decision making.

## Table of Contents

- [9.1 Merchant Analytics](#91-merchant-analytics)
- [9.2 Platform Analytics (Admin)](#92-platform-analytics-admin)

---

## 9.1 Merchant Analytics

**Purpose:** Detailed business insights for merchants

**Page:** `/merchant/analytics`

**Access:** Merchant role required

### Key Features

| Feature             | Description             |
| ------------------- | ----------------------- |
| Revenue Analytics   | Earnings breakdown      |
| Sales Metrics       | Order statistics        |
| Product Performance | Item-level insights     |
| Customer Insights   | Buyer patterns          |
| Time Filtering      | Period-based analysis   |
| Trend Analysis      | Growth tracking         |
| Top Products        | Best sellers            |
| Category Breakdown  | Performance by category |
| Export Reports      | CSV/PDF downloads       |

### Analytics Sections

---

#### Revenue Overview

| Metric              | Description         |
| ------------------- | ------------------- |
| Total Revenue       | All-time earnings   |
| Revenue by Period   | Selected timeframe  |
| Revenue Trend       | Growth over time    |
| Growth Percentage   | Period comparison   |
| Average Order Value | Revenue / Orders    |
| Revenue by Category | Category breakdown  |
| Best Day            | Highest revenue day |
| Worst Day           | Lowest revenue day  |

##### Revenue Display

```
┌─────────────────────────────────────────────────────────────────┐
│ REVENUE OVERVIEW                         [This Month ▾] [Export]│
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────┬───────────────┬───────────────┬─────────────┐ │
│ │ Total Revenue │ This Period   │ Growth        │ Avg. Order  │ │
│ │ RM 85,420     │ RM 12,500     │ ↑ 15.3%       │ RM 102.50   │ │
│ │ (All Time)    │ (This Month)  │ vs last month │             │ │
│ └───────────────┴───────────────┴───────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ REVENUE TREND                                                    │
│                                                                  │
│  RM │                                           ▲               │
│ 15k │                                    ●─────●               │
│ 12k │                             ●─────●                       │
│  9k │                      ●─────●                              │
│  6k │               ●─────●                                     │
│  3k │        ●─────●                                            │
│   0 │───●───●───────────────────────────────────────────────▶   │
│       Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Sales Metrics

| Metric              | Description          |
| ------------------- | -------------------- |
| Total Sales         | All-time order count |
| Sales Trend         | Orders over time     |
| Sales by Status     | Status distribution  |
| Completion Rate     | Completed / Total    |
| Cancellation Rate   | Cancelled / Total    |
| Avg Items per Order | Items / Orders       |
| Repeat Customers    | Return buyer rate    |

##### Sales Display

```
┌─────────────────────────────────────────────────────────────────┐
│ SALES METRICS                                                    │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┬─────────────────────────────────┐
│ │ SALES TREND                 │ ORDER STATUS                    │
│ │                             │                                 │
│ │  Orders                     │      ┌─────────────────┐        │
│ │  50 │      ▲               │      │   ● Completed   │        │
│ │  40 │   ▲──▲──▲            │      │     92%         │        │
│ │  30 │▲──▲     ──▲          │      │   ● Cancelled   │        │
│ │  20 │           ──▲        │      │     5%          │        │
│ │  10 │              ──▲     │      │   ● Pending     │        │
│ │   0 └────────────────────▶ │      │     3%          │        │
│ │     Week 1  2  3  4        │      └─────────────────┘        │
│ └─────────────────────────────┴─────────────────────────────────┘
│                                                                  │
│ ┌───────────────┬───────────────┬───────────────┬─────────────┐ │
│ │ Completion    │ Cancellation  │ Avg Items     │ Repeat      │ │
│ │ Rate          │ Rate          │ per Order     │ Customers   │ │
│ │ 92.3%         │ 4.8%          │ 2.3           │ 28%         │ │
│ └───────────────┴───────────────┴───────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Product Performance

| Metric               | Description               |
| -------------------- | ------------------------- |
| Top by Units         | Best selling products     |
| Top by Revenue       | Highest earning products  |
| Low Stock            | Items needing restock     |
| Out of Stock         | Unavailable items         |
| Product Views        | Page view counts          |
| Cart Additions       | Add to cart counts        |
| Conversion Rate      | Sales / Views per product |
| Category Performance | Sales by category         |

##### Product Performance Display

```
┌─────────────────────────────────────────────────────────────────┐
│ PRODUCT PERFORMANCE                                              │
├─────────────────────────────────────────────────────────────────┤
│ TOP SELLING PRODUCTS (by units)                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Rank │ Product              │ Units Sold │ Revenue        │  │
│ ├──────┼──────────────────────┼────────────┼────────────────┤  │
│ │ 1    │ Wireless Earbuds     │ 156        │ RM 7,800       │  │
│ │ 2    │ Phone Case           │ 134        │ RM 2,010       │  │
│ │ 3    │ USB Cable            │ 98         │ RM 980         │  │
│ │ 4    │ Screen Protector     │ 87         │ RM 870         │  │
│ │ 5    │ Power Bank           │ 65         │ RM 3,250       │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                            [View All Products →]│
├─────────────────────────────────────────────────────────────────┤
│ CATEGORY BREAKDOWN                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Electronics    ████████████████████████████  68%  RM 58,086 │ │
│ │ Accessories    ████████████                   24%  RM 20,501│ │
│ │ Services       ████                            8%  RM 6,833 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ INVENTORY ALERTS                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Low Stock: 5 products                                    │ │
│ │ ❌ Out of Stock: 2 products                                 │ │
│ │                                       [View Inventory →]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Order Analysis

| Metric              | Description              |
| ------------------- | ------------------------ |
| Status Distribution | Orders by status         |
| Pending Count       | Orders awaiting action   |
| Delivery Methods    | Popular shipping options |
| Payment Methods     | Payment type breakdown   |
| Avg Processing Time | Order to ship time       |
| Avg Delivery Time   | Ship to deliver time     |

---

### Time Period Options

| Period         | Description        |
| -------------- | ------------------ |
| Last 7 Days    | Past week          |
| Last 30 Days   | Past month         |
| Last 90 Days   | Past quarter       |
| Last 12 Months | Past year          |
| All Time       | Lifetime data      |
| Custom Range   | User-defined dates |

### User Capabilities

- Select time period (week/month/year)
- View all metrics for period
- Compare with previous period
- Export data as CSV/PDF
- See trends and patterns
- Identify best sellers
- Track business growth
- Make data-driven decisions
- Refresh analytics manually

### Chart Types

| Chart          | Data Displayed      |
| -------------- | ------------------- |
| Line Chart     | Revenue over time   |
| Bar Chart      | Sales by period     |
| Pie/Donut      | Status distribution |
| Horizontal Bar | Top products        |
| Area Chart     | Growth trends       |

### Technical Implementation

| Feature     | Implementation           |
| ----------- | ------------------------ |
| Data Model  | Pre-aggregated analytics |
| Scheduling  | Cron jobs every 15 mins  |
| Aggregation | MongoDB pipelines        |
| Charting    | Recharts library         |
| Caching     | Redis for performance    |
| Real-time   | WebSocket updates option |
| Export      | Server-side generation   |
| Responsive  | Mobile-optimized charts  |

---

## 9.2 Platform Analytics (Admin)

**Purpose:** System-wide analytics for administrators

**Page:** `/admin/analytics`

**Access:** Admin role required

**Status:** 🚧 Future Enhancement

### Planned Features

| Feature              | Description             | Status  |
| -------------------- | ----------------------- | ------- |
| Platform Revenue     | Total platform earnings | Planned |
| Transaction Volume   | All transactions        | Planned |
| Active Users         | Daily/Monthly active    | Planned |
| New Registrations    | User growth             | Planned |
| Popular Categories   | Trending items          | Planned |
| Merchant Performance | Seller rankings         | Planned |
| User Activity        | Engagement metrics      | Planned |
| System Health        | Performance metrics     | Planned |

### Planned Metrics

#### Platform Overview

| Metric               | Description             |
| -------------------- | ----------------------- |
| Total GMV            | Gross Merchandise Value |
| Platform Revenue     | Commission earnings     |
| Total Users          | Registered accounts     |
| Active Merchants     | Selling merchants       |
| Total Listings       | Products + Services     |
| Daily Active Users   | DAU count               |
| Monthly Active Users | MAU count               |

#### User Analytics

| Metric               | Description          |
| -------------------- | -------------------- |
| New Registrations    | Daily/weekly signups |
| User Retention       | Return user rate     |
| Conversion Rate      | Visitors to buyers   |
| Avg Session Duration | Time on platform     |
| Popular Pages        | Most visited         |
| User Demographics    | Campus distribution  |

#### Merchant Analytics

| Metric            | Description        |
| ----------------- | ------------------ |
| Top Merchants     | By revenue/sales   |
| New Merchants     | Registration trend |
| Merchant Churn    | Inactive rate      |
| Verification Rate | Verified %         |
| Avg Products      | Per merchant       |
| Avg Revenue       | Per merchant       |

#### Transaction Analytics

| Metric             | Description      |
| ------------------ | ---------------- |
| Daily Transactions | Order volume     |
| Payment Methods    | Stripe vs COD    |
| Avg Order Value    | Platform-wide    |
| Refund Rate        | Refunds / Orders |
| Dispute Rate       | Issues reported  |

### Planned Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Platform Analytics                      [Period: This Month ▾]  │
├─────────────────────────────────────────────────────────────────┤
│ PLATFORM OVERVIEW                                                │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬───────────┐ │
│ │ GMV     │ Revenue │ Users   │ Merchants│ Listings│ Orders   │ │
│ │ RM 1.2M │ RM 60K  │ 5,420   │ 245     │ 3,890   │ 12,450   │ │
│ │ ↑ 25%   │ ↑ 20%   │ ↑ 15%   │ ↑ 12%   │ ↑ 18%   │ ↑ 22%    │ │
│ └─────────┴─────────┴─────────┴─────────┴─────────┴───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Charts and detailed analytics...]                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Merchant Analytics

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| `GET`  | `/api/analytics/revenue`  | Get revenue analytics   |
| `GET`  | `/api/analytics/sales`    | Get sales metrics       |
| `GET`  | `/api/analytics/products` | Get product performance |
| `GET`  | `/api/analytics/orders`   | Get order analysis      |
| `GET`  | `/api/analytics/overview` | Get dashboard overview  |
| `GET`  | `/api/analytics/export`   | Export analytics data   |

### Platform Analytics (Admin)

| Method | Endpoint                            | Description        |
| ------ | ----------------------------------- | ------------------ |
| `GET`  | `/api/admin/analytics/platform`     | Platform overview  |
| `GET`  | `/api/admin/analytics/users`        | User analytics     |
| `GET`  | `/api/admin/analytics/merchants`    | Merchant analytics |
| `GET`  | `/api/admin/analytics/transactions` | Transaction data   |

---

## Data Aggregation

### Aggregation Schedule

| Job            | Frequency     | Description             |
| -------------- | ------------- | ----------------------- |
| Real-time      | On event      | Order creation, updates |
| Quick Stats    | 15 minutes    | Dashboard metrics       |
| Daily Summary  | Daily (2 AM)  | Daily aggregations      |
| Weekly Report  | Weekly (Mon)  | Weekly summaries        |
| Monthly Report | Monthly (1st) | Monthly analytics       |

### Data Retention

| Data Type          | Retention  |
| ------------------ | ---------- |
| Real-time Metrics  | 24 hours   |
| Daily Aggregates   | 1 year     |
| Weekly Aggregates  | 2 years    |
| Monthly Aggregates | Indefinite |

---

## Related Files

### Client-Side

- `client/src/pages/merchant/Analytics.js` - Analytics page
- `client/src/components/analytics/` - Chart components
- `client/src/store/slices/analyticsSlice.js` - Analytics state

### Server-Side

- `server/controllers/analytic/` - Analytics controllers
- `server/services/analytics.service.js` - Analytics service
- `server/jobs/analytics.job.js` - Scheduled jobs
- `server/models/Analytics.js` - Analytics model

---

[← Previous: Merchant Features](./08-merchant-features.md) | [Back to Index](./README.md) | [Next: Admin Panel →](./10-admin-panel.md)
