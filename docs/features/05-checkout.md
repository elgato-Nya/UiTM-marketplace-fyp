# Checkout & Payment

> Multi-step checkout process and payment integration

[← Back to Features Index](./README.md)

---

## Overview

The checkout module provides a secure, multi-step process for completing purchases with support for online payments (Stripe) and Cash on Delivery (COD).

## Table of Contents

- [5.1 Checkout Process](#51-checkout-process)
- [5.2 Checkout Success](#52-checkout-success)

---

## 5.1 Checkout Process

**Purpose:** Complete purchase transaction

**Page:** `/checkout`

**Access:** Login required + items in cart

### Key Features

| Feature              | Description                |
| -------------------- | -------------------------- |
| Multi-Step Flow      | 4-step wizard              |
| Address Selection    | Saved or new addresses     |
| Delivery Methods     | Multiple options           |
| Payment Methods      | Stripe + COD               |
| Order Review         | Final confirmation         |
| Session Timer        | 10-minute checkout window  |
| Stock Reservation    | Items held during checkout |
| Real-time Validation | Instant feedback           |

### Checkout Steps Overview

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Step 1     │──▶│   Step 2     │──▶│   Step 3     │──▶│   Step 4     │
│   Delivery   │   │   Delivery   │   │   Payment    │   │   Review &   │
│   Address    │   │   Method     │   │   Method     │   │   Confirm    │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

---

### Step 1: Delivery Address

**Purpose:** Select or add delivery location

#### Features

| Feature         | Description              |
| --------------- | ------------------------ |
| Saved Addresses | Quick selection          |
| Add New         | Inline address form      |
| Edit Existing   | Modify saved address     |
| Address Types   | Campus, Personal, Pickup |
| Validation      | Complete address check   |

#### Address Types

| Type         | Fields                        |
| ------------ | ----------------------------- |
| **Campus**   | Campus, Building, Floor, Room |
| **Personal** | Street, City, State, Postcode |
| **Pickup**   | Location, Time preference     |

#### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Delivery Address                                │
├─────────────────────────────────────────────────────────┤
│ Select a delivery address:                              │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ○ Home Address                                      │ │
│ │   John Doe, 123 Street, Shah Alam, 40000           │ │
│ │   Phone: 012-345-6789                              │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ● Campus Address (Selected)                         │ │
│ │   Building A, Floor 3, Room 301                     │ │
│ │   UiTM Shah Alam                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [+ Add New Address]                                      │
├─────────────────────────────────────────────────────────┤
│                              [Cancel] [Next: Delivery →]│
└─────────────────────────────────────────────────────────┘
```

---

### Step 2: Delivery Method

**Purpose:** Choose how items will be delivered

#### Delivery Options

| Method          | Fee               | Description                        |
| --------------- | ----------------- | ---------------------------------- |
| Self Pickup     | Seller-configured | Pick up from seller location       |
| Standard        | Seller-configured | Regular delivery                   |
| Meet-up         | Seller-configured | Arrange meeting point              |
| Campus Delivery | Seller-configured | Delivery within campus (in-campus) |
| Room Delivery   | Seller-configured | Direct to dorm/room (in-campus)    |

**Note:** Sellers configure delivery fees (RM 0-100) for each method in their shop settings. Fees can be set to RM 0 (free) at seller's discretion.

#### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Step 2: Delivery Method                                 │
├─────────────────────────────────────────────────────────┤
│ Select delivery method:                                 │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ○ Self Pickup                          RM 0.00     │ │
│ │   Pick up from seller location                      │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ● Campus Delivery (Selected)           RM 2.50     │ │
│ │   Delivery within campus                            │ │
│ │   Estimated: 1-2 business days                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Special Instructions (optional):                         │
│ [_________________________________________________]     │
├─────────────────────────────────────────────────────────┤
│                    [← Back] [Next: Payment →]           │
└─────────────────────────────────────────────────────────┘
```

---

### Step 3: Payment Method

**Purpose:** Select and configure payment

#### Payment Options

| Method                  | Description             | Requirements    |
| ----------------------- | ----------------------- | --------------- |
| **Credit Card**         | Stripe secure payment   | Orders > RM 10  |
| **Bank Transfer (FPX)** | Stripe FPX payment      | Orders > RM 10  |
| **E-Wallet (GrabPay)**  | Stripe e-wallet payment | Orders > RM 10  |
| **Cash on Delivery**    | Pay when received       | Orders ≤ RM 500 |

**Note:** Online payment (Stripe) is required for orders above RM 10 to prevent seller losses from Stripe processing fees.

#### Online Payment (Stripe)

| Feature       | Description               |
| ------------- | ------------------------- |
| Credit Card   | Visa, Mastercard, AMEX    |
| Bank Transfer | FPX (Malaysian banks)     |
| E-Wallet      | GrabPay                   |
| Security      | PCI DSS compliant         |
| 3D Secure     | Additional authentication |
| Minimum Order | > RM 10 (fee protection)  |

#### Cash on Delivery (COD)

| Requirement   | Value                   |
| ------------- | ----------------------- |
| Maximum Order | RM 500                  |
| Confirmation  | Required acknowledgment |

#### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Step 3: Payment Method                                  │
├─────────────────────────────────────────────────────────┤
│ Select payment method:                                  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ● Credit Card / FPX / E-Wallet (Selected)          │ │
│ │   ┌─────────────────────────────────────────────┐   │ │
│ │   │ Payment via Stripe                          │   │ │
│ │   │ • Credit Card (Visa, Mastercard, AMEX)      │   │ │
│ │   │ • Bank Transfer (FPX)                       │   │ │
│ │   │ • E-Wallet (GrabPay)                        │   │ │
│ │   └─────────────────────────────────────────────┘   │ │
│ │   🔒 Secured by Stripe                              │ │
│ │   Note: Required for orders > RM 10                 │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ○ Cash on Delivery (COD)                           │ │
│ │   Pay when you receive your order                   │ │
│ │   Available for orders up to RM 500                 │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    [← Back] [Next: Review →]            │
└─────────────────────────────────────────────────────────┘
```

---

### Step 4: Review & Confirm

**Purpose:** Final order review before placement

#### Review Sections

| Section  | Content                     |
| -------- | --------------------------- |
| Items    | All cart items with prices  |
| Delivery | Selected address and method |
| Payment  | Payment method summary      |
| Totals   | Breakdown and final amount  |

#### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Step 4: Review & Confirm                                │
├─────────────────────────────────────────────────────────┤
│ ⏱️ Session expires in: 08:45                             │
├─────────────────────────────────────────────────────────┤
│ ORDER ITEMS                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Img] Item 1 × 2              RM 100.00            │ │
│ │ [Img] Item 2 × 1              RM 50.00             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ DELIVERY ADDRESS                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Building A, Floor 3, Room 301, UiTM Shah Alam      │ │
│ │ Campus Pickup - FREE                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ PAYMENT                                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Online Payment - Visa •••• 4242                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ORDER SUMMARY                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Subtotal:                          RM 150.00       │ │
│ │ Shipping:                          FREE            │ │
│ │ Platform Fee:                      RM 2.00         │ │
│ │ ───────────────────────────────────────────        │ │
│ │ TOTAL:                             RM 152.00       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ☑ I agree to the Terms and Conditions                   │
├─────────────────────────────────────────────────────────┤
│                    [← Back] [🔒 Place Order]            │
└─────────────────────────────────────────────────────────┘
```

---

### Session Management

| Feature           | Value          | Description            |
| ----------------- | -------------- | ---------------------- |
| Session Duration  | 10 minutes     | Auto-expires checkout  |
| Stock Reservation | During session | Items held for user    |
| Warning           | At 2 minutes   | Visual/audio alert     |
| Auto-Release      | On expiration  | Stock returned to pool |
| Renewal           | Optional       | Extend session         |

### Payment Processing Flow

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Create      │──▶│ Process     │──▶│ Confirm     │──▶│ Complete    │
│ Payment     │   │ Payment     │   │ Payment     │   │ Order       │
│ Intent      │   │ (Stripe)    │   │ (Webhook)   │   │ Creation    │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### Error Handling

| Error              | User Action                      |
| ------------------ | -------------------------------- |
| Card Declined      | Try different card               |
| Insufficient Stock | Remove/update items              |
| Session Expired    | Restart checkout                 |
| Payment Failed     | Retry with same/different method |
| Network Error      | Automatic retry                  |

### Technical Implementation

| Component           | Technology              |
| ------------------- | ----------------------- |
| State Management    | Redux for checkout data |
| Session Storage     | Backend with Redis      |
| Payment SDK         | Stripe.js + Elements    |
| Real-time Updates   | WebSocket for stock     |
| Stock Operations    | MongoDB transactions    |
| Webhook Handling    | Stripe webhooks         |
| Email Notifications | Nodemailer queue        |

---

## 5.2 Checkout Success

**Purpose:** Confirm successful order placement

**Page:** `/checkout/success`

**Access:** Post-checkout redirect

### Key Features

| Feature            | Description                   |
| ------------------ | ----------------------------- |
| Confirmation       | Success message and animation |
| Order Number       | Unique reference ID           |
| Order Summary      | Quick details overview        |
| Receipt Download   | PDF generation                |
| Track Order        | Link to order page            |
| Continue Shopping  | Return to browse              |
| Email Confirmation | Sent automatically            |

### Success Page Layout

```
┌─────────────────────────────────────────────────────────┐
│                      ✓                                   │
│              Order Confirmed!                            │
│                                                          │
│         Thank you for your purchase                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Order Number: #ORD-2026-ABC123                          │
│ Date: January 1, 2026                                    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Items: 3                                            │ │
│ │ Total: RM 152.00                                    │ │
│ │ Payment: Online (Visa •••• 4242)                    │ │
│ │ Delivery: Campus Pickup                             │ │
│ │ Est. Delivery: Jan 3-5, 2026                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ A confirmation email has been sent to                    │
│ your@email.uitm.edu.my                                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ [📄 Download Receipt] [📦 Track Order]                   │
│                                                          │
│              [Continue Shopping]                         │
└─────────────────────────────────────────────────────────┘
```

### User Capabilities

- View order details
- Download receipt PDF
- Track order status
- Return to shopping
- View order history
- Contact seller
- Share order status

### Post-Checkout Actions

| Action            | Description           |
| ----------------- | --------------------- |
| Cart Cleared      | All items removed     |
| Session Cleaned   | Checkout data cleared |
| Email Sent        | Confirmation to buyer |
| Seller Notified   | New order alert       |
| Analytics Tracked | Purchase event logged |
| Stock Updated     | Inventory decreased   |

### Technical Implementation

| Feature        | Implementation             |
| -------------- | -------------------------- |
| Order ID       | Query parameter            |
| Data Fetch     | API call for order details |
| PDF Generation | Server-side PDF creation   |
| Email Queue    | Async email processing     |
| Analytics      | Conversion event tracking  |
| Cleanup        | Cart and session clearing  |

---

## API Endpoints

| Method   | Endpoint                 | Description             |
| -------- | ------------------------ | ----------------------- |
| `POST`   | `/api/checkout/session`  | Create checkout session |
| `GET`    | `/api/checkout/session`  | Get current session     |
| `PATCH`  | `/api/checkout/session`  | Update session data     |
| `DELETE` | `/api/checkout/session`  | Cancel checkout         |
| `POST`   | `/api/checkout/complete` | Complete order          |
| `POST`   | `/api/payment/intent`    | Create payment intent   |
| `POST`   | `/api/payment/confirm`   | Confirm payment         |
| `POST`   | `/api/webhooks/stripe`   | Stripe webhook handler  |

---

## Related Files

### Client-Side

- `client/src/pages/Checkout.js` - Checkout wizard
- `client/src/pages/CheckoutSuccess.js` - Success page
- `client/src/components/checkout/` - Checkout components
- `client/src/store/slices/checkoutSlice.js` - Checkout state

### Server-Side

- `server/controllers/checkout/` - Checkout controllers
- `server/services/payment.service.js` - Payment processing
- `server/config/stripe.config.js` - Stripe configuration
- `server/routes/payment.routes.js` - Payment routes

---

[← Previous: Shopping Experience](./04-shopping-experience.md) | [Back to Index](./README.md) | [Next: Order Management →](./06-order-management.md)
