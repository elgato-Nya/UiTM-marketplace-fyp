# Variants & Quote System Implementation Plan

**Date**: December 21, 2025  
**Status**: Planning Phase  
**Backward Compatibility**: ✅ Required

---

## 🎯 Overview

Implement marketplace-standard variants (like Shopee, Tikok Shop, Amazon) for products, and a custom quote system for services, while maintaining backward compatibility with existing listings.

---

## 📊 Current State Analysis

### Existing Listings Structure

```javascript
{
  type: "product" | "service",
  price: Number,  // Single price field
  stock: Number,  // Only for products
  // No variants field exists
}
```

### Challenges

1. **Existing listings** have no `variants` field
2. **Validation** currently requires a `price` field
3. **Database** has ~X existing listings that need migration
4. **Stock tracking** is at listing level, not variant level

---

## 🏗️ Architecture Design

### 1. Variants Schema (Products & Services)

```javascript
variants: [
  {
    _id: ObjectId, // Auto-generated
    name: String, // e.g., "Red - Large", "5-Session Package"
    sku: String, // Optional: for inventory tracking
    price: Number, // Variant-specific price
    stock: Number, // Product only: variant-specific stock
    isAvailable: Boolean, // Can disable specific variants
    attributes: {
      // Flexible key-value pairs
      color: String, // e.g., "Red"
      size: String, // e.g., "Large"
      material: String, // e.g., "Cotton"
      duration: String, // Services: "60 minutes"
      sessions: Number, // Services: number of sessions
      // ... any custom attributes
    },
    images: [String], // Optional: variant-specific images
    createdAt: Date,
    updatedAt: Date,
  },
];
```

### 2. Quote System Schema (Services Only)

```javascript
quoteSettings: {
  enabled: Boolean,               // Is quote system enabled?
  autoAccept: Boolean,            // Auto-accept all quotes?
  minPrice: Number,               // Optional: minimum quote price
  maxPrice: Number,               // Optional: maximum quote price
  responseTime: String,           // e.g., "Within 24 hours"
  requiresDeposit: Boolean,       // Require upfront deposit?
  depositPercentage: Number,      // 0-100 (e.g., 50 for 50%)
  customFields: [                 // Additional info to collect
    {
      label: String,              // e.g., "Event Date"
      type: String,               // "text", "date", "number", "select"
      required: Boolean,
      options: [String]           // For "select" type
    }
  ]
}
```

---

## 🔄 Backward Compatibility Strategy

### Phase 1: Schema Changes (Non-Breaking)

**Make all new fields OPTIONAL**:

```javascript
variants: {
  type: [{
    name: String,
    price: Number,
    stock: Number,
    // ...
  }],
  default: undefined,  // ✅ Not required
  validate: {
    validator: function(v) {
      // Only validate if variants exist
      if (!v || v.length === 0) return true;
      // ... validation logic
    }
  }
},

quoteSettings: {
  type: {
    enabled: { type: Boolean, default: false },
    // ...
  },
  default: undefined  // ✅ Not required
}
```

**Keep legacy `price` and `stock` fields**:

```javascript
price: {
  type: Number,
  required: function() {
    // Price required if NO variants AND NOT quote-based
    return !this.variants?.length && !this.quoteSettings?.enabled;
  },
  // ...
},

stock: {
  type: Number,
  required: function() {
    // Stock required for products WITHOUT variants
    return this.type === "product" && !this.variants?.length;
  },
  // ...
}
```

### Phase 2: Migration Strategy

#### Option A: Lazy Migration (Recommended)

- Existing listings continue working with `price` and `stock`
- When user edits listing, suggest upgrading to variants
- No forced migration required

#### Option B: Automated Migration

- Run migration script to convert existing listings
- Create single variant from existing price/stock

```javascript
// Migration example
{
  // Old
  price: 50.00,
  stock: 100

  // New
  variants: [
    {
      name: "Default",
      price: 50.00,
      stock: 100,
      isAvailable: true
    }
  ]
}
```

### Phase 3: Validation Updates

**Legacy Mode** (no variants):

```javascript
if (!listing.variants?.length && !listing.quoteSettings?.enabled) {
  // Require traditional price and stock
  validatePrice(listing.price);
  if (listing.type === "product") {
    validateStock(listing.stock);
  }
}
```

**Variant Mode**:

```javascript
if (listing.variants?.length > 0) {
  // Validate each variant
  listing.variants.forEach((variant) => {
    validateVariantPrice(variant.price);
    if (listing.type === "product") {
      validateVariantStock(variant.stock);
    }
  });
}
```

**Quote Mode** (services only):

```javascript
if (listing.quoteSettings?.enabled) {
  // Price is optional (will be determined via quote)
  // Validate quote settings
  validateQuoteSettings(listing.quoteSettings);
}
```

---

## 🛠️ Implementation Steps

### Step 1: Update Listing Model

- [ ] Add `variants` field (optional array)
- [ ] Add `quoteSettings` field (optional object, services only)
- [ ] Make `price` conditionally required
- [ ] Make `stock` conditionally required
- [ ] Add virtual `hasVariants`
- [ ] Add virtual `isQuoteBased`
- [ ] Add method `getMinPrice()` - returns lowest price from variants or base price
- [ ] Add method `getMaxPrice()` - returns highest price from variants or base price
- [ ] Add method `getTotalStock()` - sum of all variant stocks or base stock

### Step 2: Update Validators

- [ ] Create variant validation rules
- [ ] Create quote settings validation rules
- [ ] Update listing creation validator (conditional)
- [ ] Update listing update validator (conditional)
- [ ] Add variant-specific validators (SKU uniqueness, etc.)

### Step 3: Update Services

- [ ] Modify `createListing` to handle variants
- [ ] Modify `updateListing` to handle variants
- [ ] Add `addVariant` method
- [ ] Add `updateVariant` method
- [ ] Add `deleteVariant` method
- [ ] Add `getVariant` method
- [ ] Update stock deduction logic (check variants first)
- [ ] Add quote request handling (services only)

### Step 4: Update Controllers

- [ ] Update listing creation endpoint
- [ ] Update listing update endpoint
- [ ] Add variant management endpoints
  - `POST /listings/:id/variants` - Add variant
  - `PUT /listings/:id/variants/:variantId` - Update variant
  - `DELETE /listings/:id/variants/:variantId` - Delete variant
  - `GET /listings/:id/variants/:variantId` - Get variant
- [ ] Add quote endpoints (services only)
  - `POST /listings/:id/quote-request` - Request quote
  - `GET /listings/:id/quotes` - Get all quotes (merchant)
  - `PUT /listings/:id/quotes/:quoteId` - Respond to quote

### Step 5: Update Cart/Order Logic

- [ ] Modify cart to store `variantId` instead of just `listingId`
- [ ] Update order creation to include variant details
- [ ] Update stock deduction to target specific variant
- [ ] Add quote-based order flow (for services)

### Step 6: Frontend Updates

- [ ] Create variant selector UI
- [ ] Update listing creation form (add variants section)
- [ ] Update listing edit form (manage variants)
- [ ] Update product detail page (variant dropdown/buttons)
- [ ] Add quote request form (services)
- [ ] Add merchant quote management page
- [ ] Update cart display (show variant details)
- [ ] Update order display (show variant details)

### Step 7: Database Migration (Optional)

- [ ] Create migration script
- [ ] Test on staging database
- [ ] Migrate existing listings to variant format
- [ ] Verify data integrity

### Step 8: Testing

- [ ] Unit tests for variant validation
- [ ] Integration tests for variant CRUD
- [ ] Integration tests for quote system
- [ ] Cart/order tests with variants
- [ ] Legacy listing compatibility tests
- [ ] Performance tests (variant queries)

---

## 📋 Database Indexes

Add indexes for variant queries:

```javascript
ListingSchema.index({ "variants._id": 1 });
ListingSchema.index(
  { "variants.sku": 1, "seller.userId": 1 },
  { sparse: true }
);
ListingSchema.index({ "variants.isAvailable": 1, isAvailable: 1 });
ListingSchema.index({ "quoteSettings.enabled": 1, type: 1 }, { sparse: true });
```

---

## 🎨 UI/UX Considerations

### Variant Display Options

**Option 1: Dropdown** (Simple)

```
Color: [Red ▼]
Size:  [Large ▼]
Price: RM 50.00
Stock: 10 available
```

**Option 2: Button Grid** (Visual)

```
Color:  [Red] [Blue] [Green]
Size:   [S] [M] [L] [XL]
Price: RM 50.00
Stock: 10 available
```

**Option 3: Hybrid** (Best UX)

- Colors as visual swatches
- Sizes as buttons
- Other attributes as dropdowns

### Quote Request Flow (Services)

1. Buyer clicks "Request Quote"
2. Fill custom fields (event date, requirements, etc.)
3. Submit request
4. Merchant receives notification
5. Merchant provides quote with price breakdown
6. Buyer accepts/rejects quote
7. If accepted → Create order with quoted price

---

## ⚠️ Edge Cases & Considerations

1. **Variant Deletion**: What happens when a variant is deleted but exists in active carts/orders?

   - Solution: Soft delete (mark as unavailable), keep data for historical orders

2. **Price Changes**: Variant price changed after item added to cart?

   - Solution: Store price snapshot in cart item

3. **Out of Stock Variants**: Prevent adding to cart

   - Solution: Real-time stock checks, disable "Add to Cart" button

4. **Quote Expiry**: Quotes should have expiration dates

   - Solution: Add `expiresAt` field to quote, auto-expire after X days

5. **Minimum Variants**: Should there be a minimum variant count?

   - Solution: No minimum, allow single variant (acts as legacy mode)

6. **Maximum Variants**: Prevent performance issues

   - Solution: Limit to 100 variants per listing

7. **SKU Uniqueness**: Should SKUs be unique per merchant or globally?
   - Solution: Unique per merchant (scoped to `seller.userId`)

---

## 🚀 Rollout Plan

### Phase 1: Backend (Week 1-2)

- Implement schema changes
- Update validators
- Create API endpoints
- Write tests

### Phase 2: Frontend - Merchant (Week 3)

- Variant management UI
- Listing creation/edit updates
- Quote management dashboard

### Phase 3: Frontend - Buyer (Week 4)

- Variant selector component
- Quote request flow
- Cart/checkout updates

### Phase 4: Migration & Testing (Week 5)

- Optional: Migrate existing listings
- End-to-end testing
- Performance testing

### Phase 5: Deployment (Week 6)

- Staging deployment
- User acceptance testing
- Production deployment
- Monitoring

---

## 📊 Success Metrics

- [ ] 100% backward compatibility (existing listings work)
- [ ] All tests passing (359+ tests)
- [ ] No performance degradation
- [ ] Merchant adoption rate (% using variants)
- [ ] Quote system usage (for services)
- [ ] User feedback score

---

## 🔗 Related Documents

- [FEATURES.md](./FEATURES.md) - Update with variant features
- [TESTING.md](./TESTING.md) - Add variant test cases
- [API Documentation] - Document new variant endpoints

---

## ❓ Questions for Discussion

1. **Migration**: Lazy migration or automated migration?
2. **UI**: Which variant selector style (dropdown, buttons, hybrid)?
3. **Quotes**: Should quotes expire automatically? After how many days?
4. **SKU**: Required or optional for variants?
5. **Images**: Should each variant have its own images?
6. **Limits**: Maximum variants per listing? (suggested: 100)
7. **Quote Deposits**: Should we support deposit requirements?

---

**Next Steps**: Review this plan, answer questions, then start implementation with backward-compatible schema changes.
