# Shopping Experience

> Shopping cart and wishlist functionality

[← Back to Features Index](./README.md)

---

## Overview

The shopping experience module provides users with cart and wishlist functionality to manage their shopping journey before checkout.

## Table of Contents

- [4.1 Shopping Cart](#41-shopping-cart)
- [4.2 Wishlist](#42-wishlist)

---

## 4.1 Shopping Cart

**Purpose:** Temporary storage for items before checkout

**Page:** `/cart`

**Access:** Login required

### Key Features

| Feature             | Description               |
| ------------------- | ------------------------- |
| Add Items           | Add from listing pages    |
| View Cart           | See all added items       |
| Update Quantities   | Increase/decrease amounts |
| Remove Items        | Delete from cart          |
| Move to Wishlist    | Save for later            |
| Clear Cart          | Remove all items          |
| Price Calculations  | Real-time totals          |
| Stock Validation    | Check availability        |
| Price Notifications | Alert on changes          |
| Seller Grouping     | Group by merchant         |
| Multi-Merchant      | Support multiple sellers  |

### User Capabilities

- Add items to cart from any listing page
- See cart icon badge with item count
- View all items in cart
- Increase/decrease quantities
- Remove unwanted items
- Move items to wishlist for later
- Clear all items at once
- See subtotal calculation
- Identify unavailable items
- Notice price changes
- Proceed to checkout
- Continue shopping

### Cart Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Shopping Cart (3 items)                                          │
├─────────────────────────────────┬───────────────────────────────┤
│                                 │ Order Summary                  │
│ ┌─────────────────────────────┐ │ ┌───────────────────────────┐ │
│ │ Seller: Shop A              │ │ │ Items (3):        RM 150  │ │
│ │ ┌─────────────────────────┐ │ │ │ Shipping:         RM 10   │ │
│ │ │[Img] Item 1    RM 50    │ │ │ │ ─────────────────────────│ │
│ │ │      Qty: [- 2 +]       │ │ │ │ Total:            RM 160  │ │
│ │ │      [❤ Save] [🗑️ Remove]│ │ │ │                           │ │
│ │ └─────────────────────────┘ │ │ │ [Proceed to Checkout]     │ │
│ │ ┌─────────────────────────┐ │ │ └───────────────────────────┘ │
│ │ │[Img] Item 2    RM 30    │ │ │                               │
│ │ │      Qty: [- 1 +]       │ │ │                               │
│ │ │      [❤ Save] [🗑️ Remove]│ │ │                               │
│ │ └─────────────────────────┘ │ │                               │
│ └─────────────────────────────┘ │                               │
│                                 │                               │
│ ┌─────────────────────────────┐ │                               │
│ │ Seller: Shop B              │ │                               │
│ │ ┌─────────────────────────┐ │ │                               │
│ │ │[Img] Item 3    RM 70    │ │ │                               │
│ │ │      Qty: [- 1 +]       │ │ │                               │
│ │ │      [❤ Save] [🗑️ Remove]│ │ │                               │
│ │ └─────────────────────────┘ │ │                               │
│ └─────────────────────────────┘ │                               │
├─────────────────────────────────┴───────────────────────────────┤
│ [Clear Cart] [Continue Shopping]                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cart Item Details

| Field             | Description                |
| ----------------- | -------------------------- |
| Product Image     | Clickable to view listing  |
| Product Name      | Clickable to view listing  |
| Seller Shop       | Clickable to view shop     |
| Original Price    | If price changed           |
| Current Price     | Latest price               |
| Quantity Selector | 1 to stock limit           |
| Item Subtotal     | Price × quantity           |
| Stock Status      | Available/low/out of stock |
| Action Buttons    | Save, remove               |

### Price Calculations

| Calculation   | Formula                      |
| ------------- | ---------------------------- |
| Item Subtotal | `price × quantity`           |
| Cart Subtotal | `sum(all item subtotals)`    |
| Shipping Fee  | Varies by method             |
| Platform Fee  | If applicable                |
| Total         | `subtotal + shipping + fees` |

### Stock & Price Alerts

```
⚠️ Stock Warning
┌─────────────────────────────────────┐
│ Item A: Only 2 left in stock       │
│ Item B: Out of stock - removed     │
└─────────────────────────────────────┘

💰 Price Change Alert
┌─────────────────────────────────────┐
│ Item C price changed:               │
│ RM 50 → RM 45 (↓10%)               │
└─────────────────────────────────────┘
```

### Validations

| Validation        | Description                 |
| ----------------- | --------------------------- |
| Stock Check       | Verify item availability    |
| Quantity Limits   | Max = available stock       |
| Price Consistency | Sync with current prices    |
| Seller Status     | Verify merchant is active   |
| Item Status       | Verify listing is available |

### Technical Implementation

| Feature          | Implementation             |
| ---------------- | -------------------------- |
| Storage          | MongoDB document           |
| Real-time        | WebSocket updates (future) |
| UI Updates       | Optimistic with rollback   |
| Stock Validation | On quantity change         |
| Price Sync       | Fetch latest on view       |
| Persistence      | Cross-session storage      |
| Expiration       | 30 days inactive cleanup   |
| Operations       | Atomic transactions        |

---

## 4.2 Wishlist

**Purpose:** Save items for later purchase consideration

**Page:** `/wishlist`

**Access:** Login required

### Key Features

| Feature             | Description                |
| ------------------- | -------------------------- |
| Save Items          | Add from listing pages     |
| View Wishlist       | See all saved items        |
| Remove Items        | Delete from wishlist       |
| Move to Cart        | Quick add to cart          |
| Price Tracking      | Monitor price changes      |
| Stock Alerts        | Availability notifications |
| Sort & Filter       | Organize saved items       |
| Share Wishlist      | Social sharing (future)    |
| Price Notifications | Drop alerts (future)       |

### User Capabilities

- Add items to wishlist from listing pages
- View all saved items
- See price changes since adding
- Check stock availability
- Move items to cart quickly
- Remove items from wishlist
- Clear entire wishlist
- Sort by date added/price
- Filter by category/availability
- Get notifications for price drops (future)
- Share wishlist with friends (future)

### Wishlist Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ My Wishlist (5 items)                                            │
├─────────────────────────────────────────────────────────────────┤
│ Sort: [Date Added ▾]  Filter: [All Categories ▾]                │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [Image]  Item Name                                        │   │
│ │          RM 45.00 (was RM 50.00) ↓10%                     │   │
│ │          ● In Stock | Added: Dec 25, 2025                 │   │
│ │          [🛒 Add to Cart] [🗑️ Remove]                     │   │
│ └───────────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [Image]  Another Item                                     │   │
│ │          RM 100.00 (price unchanged)                      │   │
│ │          ⚠️ Low Stock (2 left) | Added: Dec 20, 2025      │   │
│ │          [🛒 Add to Cart] [🗑️ Remove]                     │   │
│ └───────────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [Image]  Out of Stock Item                                │   │
│ │          RM 75.00                                         │   │
│ │          ❌ Out of Stock | Added: Dec 15, 2025            │   │
│ │          [🔔 Notify Me] [🗑️ Remove]                       │   │
│ └───────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│ [Clear Wishlist]                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Wishlist Item Details

| Field          | Description         |
| -------------- | ------------------- |
| Product Image  | Clickable to view   |
| Product Name   | Clickable to view   |
| Current Price  | Latest price        |
| Original Price | Price when added    |
| Price Change   | Percentage up/down  |
| Stock Status   | Available/low/out   |
| Date Added     | When saved          |
| Action Buttons | Add to cart, remove |

### Price Tracking

| Indicator | Description       |
| --------- | ----------------- |
| ↓ Green   | Price decreased   |
| ↑ Red     | Price increased   |
| — Gray    | No change         |
| % Badge   | Change percentage |

### Stock Status Indicators

| Status       | Display           |
| ------------ | ----------------- |
| In Stock     | ● Green dot       |
| Low Stock    | ⚠️ Yellow warning |
| Out of Stock | ❌ Red indicator  |

### Sorting Options

| Sort                | Description             |
| ------------------- | ----------------------- |
| Date Added (Newest) | Most recent first       |
| Date Added (Oldest) | Earliest first          |
| Price: Low to High  | Cheapest first          |
| Price: High to Low  | Most expensive first    |
| Price Drop          | Biggest discounts first |

### Filtering Options

| Filter       | Options                       |
| ------------ | ----------------------------- |
| Category     | All 8 categories              |
| Availability | In stock, Out of stock        |
| Price Change | Dropped, Increased, Unchanged |

### Technical Implementation

| Feature        | Implementation           |
| -------------- | ------------------------ |
| Storage        | MongoDB embedded array   |
| Price Snapshot | Save price when added    |
| Price Sync     | Scheduled job comparison |
| Stock Checks   | Real-time on page load   |
| Indexing       | Fast retrieval queries   |
| Pagination     | For large wishlists      |
| History        | Price change tracking    |

---

## API Endpoints

### Cart Endpoints

| Method   | Endpoint                               | Description          |
| -------- | -------------------------------------- | -------------------- |
| `GET`    | `/api/cart`                            | Get user's cart      |
| `POST`   | `/api/cart/items`                      | Add item to cart     |
| `PATCH`  | `/api/cart/items/:id`                  | Update item quantity |
| `DELETE` | `/api/cart/items/:id`                  | Remove item          |
| `DELETE` | `/api/cart`                            | Clear entire cart    |
| `POST`   | `/api/cart/items/:id/move-to-wishlist` | Move to wishlist     |

### Wishlist Endpoints

| Method   | Endpoint                               | Description           |
| -------- | -------------------------------------- | --------------------- |
| `GET`    | `/api/wishlist`                        | Get user's wishlist   |
| `POST`   | `/api/wishlist/items`                  | Add item to wishlist  |
| `DELETE` | `/api/wishlist/items/:id`              | Remove item           |
| `DELETE` | `/api/wishlist`                        | Clear entire wishlist |
| `POST`   | `/api/wishlist/items/:id/move-to-cart` | Move to cart          |

---

## Related Files

### Client-Side

- `client/src/pages/Cart.js` - Cart page
- `client/src/pages/Wishlist.js` - Wishlist page
- `client/src/components/cart/` - Cart components
- `client/src/store/slices/cartSlice.js` - Cart Redux state
- `client/src/store/slices/wishlistSlice.js` - Wishlist Redux state

### Server-Side

- `server/controllers/cart/` - Cart controllers
- `server/controllers/wishlist/` - Wishlist controllers
- `server/models/Cart.js` - Cart model
- `server/models/Wishlist.js` - Wishlist model

---

[← Previous: Listing Management](./03-listing-management.md) | [Back to Index](./README.md) | [Next: Checkout & Payment →](./05-checkout.md)
