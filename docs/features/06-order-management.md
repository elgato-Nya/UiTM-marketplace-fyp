# Order Management

> Buyer and seller order views, order lifecycle, and tracking

[← Back to Features Index](./README.md)

---

## Overview

The order management system provides comprehensive tools for buyers to track purchases and sellers to manage sales, with a complete order lifecycle from placement to completion.

## Table of Contents

- [6.1 Purchase Orders (Buyer View)](#61-purchase-orders-buyer-view)
- [6.2 Sales Orders (Seller View)](#62-sales-orders-seller-view)
- [6.3 Order Detail Page](#63-order-detail-page)

---

## Order Status Lifecycle

```
┌──────────┐   Seller    ┌───────────┐   Seller    ┌──────────┐
│ PENDING  │────────────▶│ CONFIRMED │────────────▶│ SHIPPED  │
└──────────┘   confirms  └───────────┘   ships     └──────────┘
     │                         │                         │
     │ Buyer/Seller           │                         │ Seller marks
     │ cancels                │                         │ delivered
     ▼                        ▼                         ▼
┌───────────┐          ┌───────────┐            ┌───────────┐
│ CANCELLED │          │ CANCELLED │            │ DELIVERED │
└───────────┘          └───────────┘            └───────────┘
                                                      │
                                                      │ Auto (3 days)
                                                      │ or manual
                                                      ▼
                                                ┌───────────┐
                                                │ COMPLETED │
                                                └───────────┘
```

---

## 6.1 Purchase Orders (Buyer View)

**Purpose:** View and manage orders as a buyer

**Page:** `/orders/purchases`

**Access:** Login required

### Key Features

| Feature          | Description              |
| ---------------- | ------------------------ |
| Order List       | All purchase orders      |
| Status Filtering | Filter by order status   |
| Date Filtering   | Filter by date range     |
| Search           | Find by order number     |
| Status Badges    | Visual status indicators |
| Quick Actions    | View, cancel, track      |
| Pagination       | Navigate large lists     |
| Order Details    | Detailed view link       |

### User Capabilities

- View all their purchase orders
- Filter by status (pending, confirmed, shipped, delivered, completed, cancelled)
- Search by order number
- Sort by date/amount
- View order details
- Cancel eligible orders
- Track shipment status
- Contact seller
- Leave review (after delivery)
- Request refund (future)
- Reorder items (future)

### Status Filters

| Status    | Description                  | Can Cancel?          |
| --------- | ---------------------------- | -------------------- |
| Pending   | Awaiting seller confirmation | ✅ Yes               |
| Confirmed | Seller accepted order        | ✅ Yes (with reason) |
| Shipped   | Order in transit             | ❌ No                |
| Delivered | Received by buyer            | ❌ No                |
| Completed | Order finalized              | ❌ No                |
| Cancelled | Order cancelled              | ❌ N/A               |

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ My Purchases                                                     │
├─────────────────────────────────────────────────────────────────┤
│ [All (15)] [Pending (2)] [Confirmed (1)] [Shipped (1)]          │
│ [Delivered (3)] [Completed (7)] [Cancelled (1)]                 │
├─────────────────────────────────────────────────────────────────┤
│ Search: [Order number...] Sort: [Newest ▾] Date: [Last 30 days]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order #ORD-2026-ABC123                    [SHIPPED] 🚚      │ │
│ │ Jan 1, 2026 | 3 items | RM 152.00                          │ │
│ │ Seller: Shop ABC                                           │ │
│ │ Est. Delivery: Jan 3-5, 2026                               │ │
│ │                                [Track] [View Details]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order #ORD-2025-XYZ789                    [PENDING] ⏳      │ │
│ │ Dec 31, 2025 | 1 item | RM 45.00                           │ │
│ │ Seller: Shop XYZ                                           │ │
│ │ Awaiting seller confirmation                                │ │
│ │                                [Cancel] [View Details]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│               [< Prev] [1] [2] [3] [Next >]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Order Card Information

| Field         | Description           |
| ------------- | --------------------- |
| Order Number  | Unique order ID       |
| Date          | Order placement date  |
| Items Count   | Number of items       |
| Total Amount  | Final order total     |
| Seller        | Shop name             |
| Status Badge  | Current status        |
| Est. Delivery | Expected arrival      |
| Quick Actions | Context-based buttons |

### Cancellation Rules

| Status    | Can Cancel | Reason Required |
| --------- | ---------- | --------------- |
| Pending   | ✅ Yes     | No              |
| Confirmed | ✅ Yes     | Yes             |
| Shipped   | ❌ No      | N/A             |
| Delivered | ❌ No      | N/A             |

### Technical Implementation

| Feature       | Implementation           |
| ------------- | ------------------------ |
| Queries       | Indexed buyer queries    |
| Status Index  | Fast status filtering    |
| Real-time     | WebSocket status updates |
| Cancellation  | Workflow with validation |
| Notifications | Email/in-app alerts      |
| Analytics     | Order tracking events    |

---

## 6.2 Sales Orders (Seller View)

**Purpose:** Manage orders as a merchant

**Page:** `/merchant/orders`

**Access:** Merchant role required

### Key Features

| Feature             | Description           |
| ------------------- | --------------------- |
| Sales List          | All orders for shop   |
| Status Filtering    | Filter by status      |
| Urgent Highlight    | Orders needing action |
| Order Management    | Status updates        |
| Bulk Actions        | Mass updates (future) |
| Performance Metrics | Sales statistics      |
| Export              | Download order data   |

### User Capabilities

- View all their sales
- Filter by status
- Identify urgent orders (need action)
- View order details
- Confirm pending orders
- Mark orders as shipped
- Add tracking information
- Mark as delivered
- Add order notes
- Contact buyer
- Export order data
- View sales statistics

### Seller Actions by Status

| Status        | Available Actions              |
| ------------- | ------------------------------ |
| **Pending**   | Confirm, Cancel                |
| **Confirmed** | Mark as Shipped (add tracking) |
| **Shipped**   | Mark as Delivered              |
| **Delivered** | Complete (auto after 3 days)   |
| **Completed** | View only                      |
| **Cancelled** | View only                      |

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Sales Orders                            [📊 Analytics] [Export] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                       │
│ │ Today   │ Week    │ Month   │ Total   │                       │
│ │ RM 450  │ RM 2.5k │ RM 12k  │ RM 85k  │                       │
│ │ 5 orders│ 25 ord  │ 120 ord │ 850 ord │                       │
│ └─────────┴─────────┴─────────┴─────────┘                       │
├─────────────────────────────────────────────────────────────────┤
│ [All (850)] [⚠️ Pending (3)] [Confirmed (5)] [Shipped (12)]     │
│ [Delivered (30)] [Completed (790)] [Cancelled (10)]             │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ URGENT - Action Required                                 │ │
│ │ Order #ORD-2026-NEW001                    [PENDING] ⏳      │ │
│ │ Jan 1, 2026 | 2 items | RM 85.00                           │ │
│ │ Buyer: John Doe | 012-345-6789                             │ │
│ │                               [✓ Confirm] [✗ Cancel]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order #ORD-2026-CONF02                   [CONFIRMED] ✓     │ │
│ │ Dec 31, 2025 | 1 item | RM 120.00                          │ │
│ │ Buyer: Jane Smith | 011-234-5678                           │ │
│ │                               [🚚 Mark as Shipped]          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│               [< Prev] [1] [2] [3] [Next >]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Tracking Information Form

```
┌─────────────────────────────────────────────────────────┐
│ Add Tracking Information                                 │
├─────────────────────────────────────────────────────────┤
│ Carrier: [J&T Express ▾]                                 │
│ Tracking Number: [JT123456789______________]            │
│ Tracking URL: [https://___________________] (optional)  │
│ Est. Delivery: [Jan 5, 2026 📅]                         │
│ Notes: [_________________________________]              │
├─────────────────────────────────────────────────────────┤
│                     [Cancel] [Save & Mark as Shipped]    │
└─────────────────────────────────────────────────────────┘
```

### Urgent Orders Indicators

| Indicator       | Meaning                |
| --------------- | ---------------------- |
| ⚠️ Red Badge    | Pending > 24 hours     |
| 🔔 Yellow Badge | Pending < 24 hours     |
| 📦 Blue Badge   | Shipped, update needed |

### Technical Implementation

| Feature            | Implementation            |
| ------------------ | ------------------------- |
| Seller Queries     | Shop-specific filtering   |
| Status Transitions | Validation middleware     |
| Notifications      | Buyer email alerts        |
| Analytics          | Sales metrics aggregation |
| Bulk Operations    | Transaction support       |
| Export             | CSV/JSON generation       |

---

## 6.3 Order Detail Page

**Purpose:** Display comprehensive order information

**Page:** `/orders/:id`

**Access:** Order participant (buyer/seller) or admin

### Key Features

| Feature            | Description              |
| ------------------ | ------------------------ |
| Complete Info      | All order details        |
| Dual Perspective   | Buyer and seller views   |
| Status Timeline    | Order history            |
| Item Details       | Products with prices     |
| Party Information  | Buyer/seller details     |
| Delivery Address   | Shipping destination     |
| Payment Details    | Transaction info         |
| Role-Based Actions | Context-specific buttons |
| Order Notes        | Communication thread     |
| Print/Download     | Invoice generation       |

### User Capabilities

- View all order details
- See order timeline
- Check payment status
- View delivery address
- See item details
- View counterparty info
- Take role-specific actions
- Download invoice/receipt
- Print order details
- Track shipment
- Add notes
- Upload proof of delivery (seller)

### Order Detail Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Order #ORD-2026-ABC123                         [SHIPPED] 🚚     │
│ Placed: Jan 1, 2026 at 10:30 AM                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ORDER TIMELINE                                                   │
│ ──────────────────────────────────────────────────────────────  │
│ ● Jan 1, 10:30  │ Order Placed                                  │
│ ● Jan 1, 11:45  │ Seller Confirmed                              │
│ ● Jan 2, 09:00  │ Shipped - Tracking: JT123456789               │
│ ○ Pending       │ Delivered                                      │
│ ○ Pending       │ Completed                                      │
│                                                                  │
├───────────────────────────────┬─────────────────────────────────┤
│ ORDER ITEMS                   │ ORDER SUMMARY                    │
│ ┌───────────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ [Img] Product A           │ │ │ Subtotal:       RM 150.00  │ │
│ │       Qty: 2 × RM 50      │ │ │ Shipping:       RM 0.00    │ │
│ │       Subtotal: RM 100    │ │ │ Platform Fee:   RM 2.00    │ │
│ ├───────────────────────────┤ │ │ ─────────────────────────  │ │
│ │ [Img] Product B           │ │ │ TOTAL:          RM 152.00  │ │
│ │       Qty: 1 × RM 50      │ │ └─────────────────────────────┘ │
│ │       Subtotal: RM 50     │ │                                 │
│ └───────────────────────────┘ │ PAYMENT                         │
│                               │ ┌─────────────────────────────┐ │
│ DELIVERY ADDRESS              │ │ Method: Online (Stripe)     │ │
│ ┌───────────────────────────┐ │ │ Status: ✓ Paid              │ │
│ │ John Doe                  │ │ │ Transaction: pi_xxx123      │ │
│ │ Building A, Floor 3       │ │ │ Date: Jan 1, 2026           │ │
│ │ Room 301                  │ │ └─────────────────────────────┘ │
│ │ UiTM Shah Alam            │ │                                 │
│ │ 📞 012-345-6789           │ │                                 │
│ └───────────────────────────┘ │                                 │
├───────────────────────────────┴─────────────────────────────────┤
│ SELLER INFORMATION                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Logo] Shop ABC ✓                                           │ │
│ │ 📧 shop@email.com | 📞 019-876-5432                         │ │
│ │                                      [Contact Seller]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [📄 Download Receipt] [🖨️ Print] [📦 Track Shipment]           │
└─────────────────────────────────────────────────────────────────┘
```

### Role-Based Actions

#### Buyer Actions

| Action           | When Available     |
| ---------------- | ------------------ |
| Cancel Order     | Pending, Confirmed |
| Contact Seller   | Always             |
| Report Issue     | After shipped      |
| Leave Review     | After delivered    |
| Download Receipt | Always             |
| Reorder Items    | Completed          |

#### Seller Actions

| Action            | When Available |
| ----------------- | -------------- |
| Confirm Order     | Pending        |
| Add Tracking      | Confirmed      |
| Mark as Shipped   | Confirmed      |
| Mark as Delivered | Shipped        |
| Add Notes         | Always         |
| Contact Buyer     | Always         |
| Generate Invoice  | Always         |

### Status Timeline

| Status    | Timestamp    | Actor   | Notes                 |
| --------- | ------------ | ------- | --------------------- |
| Placed    | Jan 1, 10:30 | System  | Order created         |
| Confirmed | Jan 1, 11:45 | Seller  | Accepted order        |
| Shipped   | Jan 2, 09:00 | Seller  | Tracking: JT123456789 |
| Delivered | -            | Pending | -                     |
| Completed | -            | Pending | -                     |

### Technical Implementation

| Feature    | Implementation           |
| ---------- | ------------------------ |
| Component  | Unified for both roles   |
| Rendering  | Role-based conditional   |
| Real-time  | WebSocket status updates |
| Validation | Action permission checks |
| Timeline   | Event sourcing pattern   |
| PDF        | Server-side generation   |
| Print      | CSS print optimization   |

---

## API Endpoints

| Method  | Endpoint                   | Description          |
| ------- | -------------------------- | -------------------- |
| `GET`   | `/api/orders/purchases`    | Get buyer's orders   |
| `GET`   | `/api/orders/sales`        | Get seller's orders  |
| `GET`   | `/api/orders/:id`          | Get order details    |
| `PATCH` | `/api/orders/:id/cancel`   | Cancel order         |
| `PATCH` | `/api/orders/:id/confirm`  | Confirm order        |
| `PATCH` | `/api/orders/:id/ship`     | Mark as shipped      |
| `PATCH` | `/api/orders/:id/deliver`  | Mark as delivered    |
| `PATCH` | `/api/orders/:id/complete` | Mark as completed    |
| `POST`  | `/api/orders/:id/notes`    | Add order notes      |
| `GET`   | `/api/orders/:id/receipt`  | Download receipt PDF |

---

## Related Files

### Client-Side

- `client/src/pages/orders/Purchases.js` - Buyer orders page
- `client/src/pages/orders/Sales.js` - Seller orders page
- `client/src/pages/orders/OrderDetail.js` - Order detail page
- `client/src/store/slices/orderSlice.js` - Order Redux state

### Server-Side

- `server/controllers/order/` - Order controllers
- `server/models/Order.js` - Order model
- `server/services/order.service.js` - Order business logic
- `server/validators/order.validator.js` - Validation rules

---

[← Previous: Checkout](./05-checkout.md) | [Back to Index](./README.md) | [Next: Profile Management →](./07-profile-management.md)
