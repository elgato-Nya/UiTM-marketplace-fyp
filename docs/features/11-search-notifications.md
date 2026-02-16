# Search & Notifications

> Global search, filtering system, and notification services

[← Back to Features Index](./README.md)

---

## Overview

The search and notification systems enable users to discover content efficiently and stay informed about important platform events.

## Table of Contents

- [11.1 Global Search](#111-global-search)
- [11.2 Filtering System](#112-filtering-system)
- [11.3 Notification System](#113-notification-system)

---

## 11.1 Global Search

**Purpose:** Find listings across the platform

**Access:** All users (public)

### Key Features

| Feature          | Description           | Status         |
| ---------------- | --------------------- | -------------- |
| Full-Text Search | Search by keywords    | ✅ Implemented |
| Auto-Suggestions | Real-time suggestions | ✅ Implemented |
| Recent Searches  | Search history        | ⚡ Partial     |
| Popular Searches | Trending terms        | 🚧 Planned     |
| Search History   | User search log       | 🚧 Planned     |
| Advanced Filters | Combined with search  | ✅ Implemented |
| Sort Options     | Results ordering      | ✅ Implemented |

### Search Behavior

| Input       | Search Fields      |
| ----------- | ------------------ |
| Keywords    | Title, description |
| Category    | Category filter    |
| Price Range | Min-max price      |
| Location    | Campus filter      |
| Type        | Product/Service    |

### User Capabilities

- Search by keyword from any page
- See search suggestions as typing
- Filter results by multiple criteria
- Sort results by relevance
- Save searches for later (future)
- Share search results via URL

### Search Components

```
┌─────────────────────────────────────────────────────────────────┐
│ SEARCH BAR (Header)                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 [Search for products, services...________] [Search]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ SUGGESTIONS DROPDOWN                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📕 laptop                     in Electronics                │ │
│ │ 📕 laptop bag                 in Accessories                │ │
│ │ 📕 laptop stand               in Home & Living              │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ Recent Searches                                             │ │
│ │ 🕐 wireless earbuds                                         │ │
│ │ 🕐 textbook calculus                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Search Results

```
┌─────────────────────────────────────────────────────────────────┐
│ Search Results for "laptop"                    125 results found│
├─────────────────────────────────────────────────────────────────┤
│ Sort: [Relevance ▾]                                             │
├─────────────────────────────────────────────────────────────────┤
│ [Listing Card] [Listing Card] [Listing Card] [Listing Card]    │
│ [Listing Card] [Listing Card] [Listing Card] [Listing Card]    │
│ ...                                                              │
├─────────────────────────────────────────────────────────────────┤
│            [< Prev] [1] [2] [3] ... [13] [Next >]               │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Implementation

| Feature       | Implementation             |
| ------------- | -------------------------- |
| Search Engine | MongoDB text indexes       |
| Suggestions   | Debounced API (300ms)      |
| Caching       | Redis for popular searches |
| Indexing      | Compound text indexes      |
| Relevance     | Text score sorting         |
| Future        | Elasticsearch integration  |

### Planned Enhancements

| Enhancement      | Description             |
| ---------------- | ----------------------- |
| Elasticsearch    | Better full-text search |
| Typo Tolerance   | Fuzzy matching          |
| Synonyms         | Related term matching   |
| Relevance Tuning | Improved scoring        |
| Voice Search     | Speech input            |

---

## 11.2 Filtering System

**Purpose:** Refine search and browse results

### Filter Categories

| Filter       | Type         | Options               |
| ------------ | ------------ | --------------------- |
| Category     | Multi-select | 8 categories          |
| Price Range  | Slider       | Min-Max RM            |
| Type         | Toggle       | Product/Service       |
| Availability | Toggle       | In stock only         |
| Location     | Dropdown     | Campuses              |
| Condition    | Toggle       | New/Used              |
| Rating       | Stars        | 4+, 3+, etc. (future) |
| Merchant     | Checkbox     | Verified only         |

### Category Options

| Category      | Icon | Description           |
| ------------- | ---- | --------------------- |
| Books & Notes | 📚   | Textbooks, materials  |
| Fashion       | 👕   | Clothing, accessories |
| Electronics   | 💻   | Devices, gadgets      |
| Gaming        | 🎮   | Games, consoles       |
| Mobile        | 📱   | Phones, tablets       |
| Home & Living | 🏠   | Dorm essentials       |
| Art & Crafts  | 🎨   | Handmade items        |
| Services      | 🔧   | Tutoring, repairs     |

### Filter UI

```
┌─────────────────────────────────────────────────────────────────┐
│ FILTERS SIDEBAR (Desktop)                                        │
├─────────────────────────────────────────────────────────────────┤
│ CATEGORY                                                         │
│ ☐ All Categories                                                 │
│ ☑ Electronics (45)                                               │
│ ☑ Mobile (32)                                                    │
│ ☐ Fashion (28)                                                   │
│ ☐ Books & Notes (24)                                             │
│ ☐ Home & Living (18)                                             │
│ ☐ Gaming (15)                                                    │
│ ☐ Art & Crafts (12)                                              │
│ ☐ Services (8)                                                   │
├─────────────────────────────────────────────────────────────────┤
│ TYPE                                                             │
│ (●) All  (○) Products  (○) Services                             │
├─────────────────────────────────────────────────────────────────┤
│ PRICE RANGE                                                      │
│ RM [0___] ─────●─────●───── [500___]                             │
│             Min       Max                                        │
├─────────────────────────────────────────────────────────────────┤
│ AVAILABILITY                                                     │
│ ☑ In Stock Only                                                  │
├─────────────────────────────────────────────────────────────────┤
│ CAMPUS                                                           │
│ [All Campuses ▾]                                                 │
├─────────────────────────────────────────────────────────────────┤
│ CONDITION                                                        │
│ ☐ New Only  ☐ Used Only                                         │
├─────────────────────────────────────────────────────────────────┤
│ MERCHANT                                                         │
│ ☐ Verified Merchants Only                                        │
├─────────────────────────────────────────────────────────────────┤
│ [Clear All Filters]                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Active Filters Display

```
┌─────────────────────────────────────────────────────────────────┐
│ Active Filters:                                                  │
│ [Electronics ✕] [Mobile ✕] [RM 50-200 ✕] [In Stock ✕]          │
│                                              [Clear All]        │
└─────────────────────────────────────────────────────────────────┘
```

### User Capabilities

- Apply multiple filters simultaneously
- Clear individual filters
- Clear all filters at once
- See active filter chips
- Save filter combinations (future)
- Share filtered URLs
- See count per filter option

### URL State Management

```
/browse?
  category=electronics,mobile&
  priceMin=50&
  priceMax=200&
  type=product&
  inStock=true&
  campus=shah-alam&
  sort=price-asc&
  page=1
```

### Technical Implementation

| Feature     | Implementation           |
| ----------- | ------------------------ |
| URL State   | Query parameters         |
| Database    | Indexed compound queries |
| Counts      | Aggregation pipelines    |
| Caching     | Redis for filter options |
| Performance | Optimized indexes        |

---

## 11.3 Notification System

**Purpose:** Keep users informed of important events

**Status:** ✅ Implemented (Phase 1 — Polling + Email)

### Features

| Feature                  | Description          | Status                   |
| ------------------------ | -------------------- | ------------------------ |
| In-App Notifications     | Bell icon alerts     | ✅ Implemented           |
| Email Notifications      | 6 critical types     | ✅ Implemented           |
| Push Notifications       | Mobile alerts        | 🚧 Phase 2               |
| Notification Preferences | Per-category control | ✅ Implemented           |
| Real-time Updates        | Socket.io            | 🚧 Phase 2 (polling now) |
| Notification History     | 30-day retention     | ✅ Implemented           |

### Notification Types

#### Order Notifications

| Event           | Recipient     | Channel             |
| --------------- | ------------- | ------------------- |
| Order Placed    | Buyer, Seller | In-app, Email       |
| Order Confirmed | Buyer         | In-app, Email       |
| Order Shipped   | Buyer         | In-app, Email, Push |
| Order Delivered | Buyer, Seller | In-app, Email       |
| Order Cancelled | Buyer, Seller | In-app, Email       |

#### Shopping Notifications

| Event           | Recipient      | Channel       |
| --------------- | -------------- | ------------- |
| Price Drop      | Wishlist users | In-app, Email |
| Back in Stock   | Wishlist users | In-app, Push  |
| Cart Reminder   | Buyer          | Email         |
| Low Stock Alert | Seller         | In-app, Email |

#### System Notifications

| Event               | Recipient | Channel       |
| ------------------- | --------- | ------------- |
| Welcome             | New user  | Email         |
| Password Reset      | User      | Email         |
| Account Suspended   | User      | Email         |
| Verification Status | Merchant  | In-app, Email |
| Platform Updates    | All users | In-app        |

### Notification Center UI

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔔 Notifications                           [Mark All as Read]  │
├─────────────────────────────────────────────────────────────────┤
│ TODAY                                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📦 Order Shipped                                   10:30 AM │ │
│ │ Your order #ORD-2026-001 has been shipped                   │ │
│ │ Track: JT123456789                              [View Order]│ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💰 Price Drop!                                     9:15 AM │ │
│ │ "Wireless Earbuds" is now RM 45 (was RM 55)                 │ │
│ │                                              [View Listing] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ YESTERDAY                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ● New order received                              2:30 PM  │ │
│ │ Order #ORD-2026-002 from John Doe                           │ │
│ │                                              [View Order]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                        [View All Notifications] │
└─────────────────────────────────────────────────────────────────┘
```

### Notification Preferences

```
┌─────────────────────────────────────────────────────────────────┐
│ Notification Settings                                            │
├─────────────────────────────────────────────────────────────────┤
│ ORDER UPDATES                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order confirmations          [In-App ✓] [Email ✓] [Push ○] │ │
│ │ Shipping updates             [In-App ✓] [Email ✓] [Push ✓] │ │
│ │ Delivery notifications       [In-App ✓] [Email ✓] [Push ✓] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SHOPPING ALERTS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Price drops (wishlist)       [In-App ✓] [Email ✓] [Push ○] │ │
│ │ Back in stock                [In-App ✓] [Email ○] [Push ✓] │ │
│ │ Cart reminders               [In-App ○] [Email ✓] [Push ○] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MERCHANT ALERTS (if merchant)                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ New orders                   [In-App ✓] [Email ✓] [Push ✓] │ │
│ │ Low stock alerts             [In-App ✓] [Email ✓] [Push ○] │ │
│ │ Reviews received             [In-App ✓] [Email ○] [Push ○] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                                  [Save Settings] │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Implementation

| Component   | Technology                       | Status         |
| ----------- | -------------------------------- | -------------- |
| In-App      | Polling (30s) → Socket.io later  | ✅ Implemented |
| Email       | Nodemailer + AWS SES (6 types)   | ✅ Implemented |
| Push        | Firebase Cloud Messaging         | 🚧 Phase 2     |
| Queue       | Bull + Redis                     | 🚧 Phase 2     |
| Storage     | MongoDB notifications collection | ✅ Implemented |
| Preferences | User document embedded           | ✅ Implemented |
| Cleanup     | Cron job (30-day TTL)            | ✅ Implemented |

### Notification Data Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'order_shipped' | 'price_drop' | ...,
  title: String,
  message: String,
  data: {
    orderId: ObjectId,
    listingId: ObjectId,
    ...
  },
  read: Boolean,
  channels: ['in_app', 'email', 'push'],
  createdAt: Date,
  readAt: Date
}
```

---

## API Endpoints

### Search

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| `GET`  | `/api/search`             | Search listings     |
| `GET`  | `/api/search/suggestions` | Get suggestions     |
| `GET`  | `/api/search/popular`     | Popular searches    |
| `GET`  | `/api/search/history`     | User search history |

### Notifications (✅ Implemented)

| Method   | Endpoint                         | Description            | Status |
| -------- | -------------------------------- | ---------------------- | ------ |
| `GET`    | `/api/notifications`             | Get user notifications | ✅     |
| `GET`    | `/api/notifications/unread`      | Get unread count       | ✅     |
| `PATCH`  | `/api/notifications/:id/read`    | Mark as read           | ✅     |
| `PATCH`  | `/api/notifications/read-all`    | Mark all read          | ✅     |
| `DELETE` | `/api/notifications/:id`         | Delete notification    | ✅     |
| `DELETE` | `/api/notifications/read`        | Delete all read        | ✅     |
| `GET`    | `/api/notifications/preferences` | Get preferences        | ✅     |
| `PUT`    | `/api/notifications/preferences` | Update preferences     | ✅     |

---

## Related Files

### Client-Side

- `client/src/components/search/SearchBar.js`
- `client/src/components/search/SearchResults.js`
- `client/src/components/filters/FilterSidebar.js`
- `client/src/services/notificationService.js`
- `client/src/hooks/useNotification.js`
- `client/src/contexts/NotificationContext.js`
- `client/src/components/notification/NotificationItem.js`
- `client/src/components/notification/NotificationDropdown.js`
- `client/src/pages/Notifications/NotificationsPage.js`
- `client/src/pages/Notifications/NotificationPreferencesPage.js`

### Server-Side

- `server/controllers/listing/search.controller.js`
- `server/services/search.service.js`
- `server/utils/enums/notification.enum.js`
- `server/models/notification/notification.model.js`
- `server/services/notification/notification.service.js`
- `server/controllers/notification/notification.controller.js`
- `server/validators/notification.validator.js`
- `server/routes/notification.routes.js`
- `server/jobs/notification-cleanup.job.js`

---

[← Previous: Admin Panel](./10-admin-panel.md) | [Back to Index](./README.md) | [Next: Cross-Cutting Concerns →](./12-cross-cutting.md)
