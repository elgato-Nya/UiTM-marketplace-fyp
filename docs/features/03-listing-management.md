# Listing Management

> Create, edit, and manage product and service listings

[← Back to Features Index](./README.md)

---

## Overview

The listing management system enables merchants to create, publish, and manage their products and services. It includes comprehensive form validation, image handling, and inventory management.

## Table of Contents

- [3.1 Create Listing](#31-create-listing)
- [3.2 Edit Listing](#32-edit-listing)
- [3.3 My Listings](#33-my-listings)

---

## 3.1 Create Listing

**Purpose:** Allow merchants to add new products/services to the platform

**Page:** `/merchant/listings/create`

**Access:** Merchant role required

### Key Features

| Feature             | Description              |
| ------------------- | ------------------------ |
| Type Selection      | Product or Service       |
| Multi-Step Form     | Wizard-style interface   |
| Image Upload        | Up to 10 images          |
| Image Management    | Preview, reorder, delete |
| Rich Description    | Formatted text editor    |
| Category Selection  | 8 categories available   |
| Price Setting       | RM currency format       |
| Stock Management    | Products only            |
| Availability Toggle | Quick on/off switch      |
| Draft Save          | Save progress locally    |
| Form Validation     | Real-time feedback       |

### User Capabilities

- Choose listing type (Product/Service)
- Enter listing details
- Upload multiple images (drag-and-drop)
- Reorder images
- Set primary image
- Write detailed description
- Select appropriate category
- Set competitive price
- Define stock quantity (products)
- Mark as available/unavailable
- Save as draft
- Preview before publishing
- Publish immediately
- Edit after creation

### Form Fields

| Field        | Type        | Requirements  | Validation                     |
| ------------ | ----------- | ------------- | ------------------------------ |
| Type         | Radio       | Required      | Product or Service             |
| Name         | Text        | Required      | 3-100 characters, no HTML      |
| Description  | Textarea    | Optional      | Max 1000 characters, sanitized |
| Price        | Number      | Required      | Positive number, RM format     |
| Category     | Dropdown    | Required      | Valid category enum            |
| Images       | File Upload | Required      | 1-10 images, max 5MB each      |
| Stock        | Number      | Products only | Non-negative integer           |
| Availability | Toggle      | Optional      | Boolean, defaults to true      |

### Form Wizard Steps

```
Step 1: Basic Info          Step 2: Details             Step 3: Review
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ • Type          │   →    │ • Description   │   →    │ • Preview       │
│ • Name          │        │ • Images        │        │ • Confirm       │
│ • Category      │        │ • Stock         │        │ • Publish       │
│ • Price         │        │ • Availability  │        │                 │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

### Image Upload Specifications

| Specification | Value                         |
| ------------- | ----------------------------- |
| Minimum       | 1 image required              |
| Maximum       | 10 images                     |
| File Size     | Max 5MB per image             |
| Formats       | JPG, PNG, WebP                |
| Primary Image | First image by default        |
| Reordering    | Drag-and-drop support         |
| Compression   | Auto-compressed before upload |
| Storage       | AWS S3                        |

### Validation Rules

| Field    | Rule         | Error Message                    |
| -------- | ------------ | -------------------------------- |
| Name     | Required     | "Name is required"               |
| Name     | 3-100 chars  | "Name must be 3-100 characters"  |
| Name     | No HTML      | "HTML is not allowed"            |
| Price    | Required     | "Price is required"              |
| Price    | Positive     | "Price must be greater than 0"   |
| Category | Required     | "Please select a category"       |
| Images   | Min 1        | "At least one image is required" |
| Images   | Max 10       | "Maximum 10 images allowed"      |
| Images   | Valid format | "Only JPG, PNG, WebP allowed"    |
| Stock    | Non-negative | "Stock cannot be negative"       |

### Technical Implementation

| Component      | Technology                 |
| -------------- | -------------------------- |
| Form State     | React Hook Form + Redux    |
| Image Upload   | Multi-part form data to S3 |
| Compression    | Browser-side before upload |
| Progress       | Upload progress indicators |
| Draft Save     | localStorage persistence   |
| Validation     | Client + Server side       |
| Error Handling | Error boundary components  |

---

## 3.2 Edit Listing

**Purpose:** Allow merchants to update existing listings

**Page:** `/merchant/listings/:id/edit`

**Access:** Merchant role + ownership verification

### Key Features

| Feature             | Description             |
| ------------------- | ----------------------- |
| Pre-filled Form     | Loads existing data     |
| All Create Features | Full editing capability |
| Image Management    | Add, remove, reorder    |
| Status Updates      | Toggle availability     |
| Stock Updates       | Adjust inventory        |
| Price Adjustment    | Update pricing          |
| Delete Option       | Remove listing entirely |
| Change Preview      | See updates before save |

### User Capabilities

- Load existing listing data
- Update any field
- Add new images
- Remove existing images
- Reorder images
- Change primary image
- Update stock quantity
- Toggle availability
- Delete listing (with confirmation)
- Save changes
- Preview updated listing
- Cancel and discard changes

### Additional Features

| Feature             | Description            |
| ------------------- | ---------------------- |
| Deletion Dialog     | Confirmation required  |
| Listing Analytics   | View performance stats |
| Performance Metrics | Views, cart adds       |
| Stock History       | Track changes (future) |
| Price History       | Track changes (future) |

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Edit Listing: [Listing Title]                           │
│ Last updated: Jan 1, 2026 at 10:30 AM                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Same form as Create, pre-filled]                      │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ DANGER ZONE                                         │ │
│ │ [🗑️ Delete Listing]                                 │ │
│ │ This action cannot be undone.                       │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ [Cancel] [Preview Changes] [Save Changes]               │
└─────────────────────────────────────────────────────────┘
```

### Technical Implementation

| Feature             | Implementation            |
| ------------------- | ------------------------- |
| Optimistic Updates  | Immediate UI feedback     |
| Conflict Resolution | Handle concurrent edits   |
| Image Caching       | Preserve existing URLs    |
| API Method          | PATCH for partial updates |
| Ownership Check     | Middleware verification   |
| Soft Delete         | Archive instead of remove |
| Change Tracking     | Audit log in database     |

---

## 3.3 My Listings

**Purpose:** Merchant's listing management dashboard

**Page:** `/merchant/listings`

**Access:** Merchant role required

### Key Features

| Feature           | Description                         |
| ----------------- | ----------------------------------- |
| All Listings      | View all merchant products/services |
| Status Filters    | Active, inactive                    |
| Category Filters  | Filter by category                  |
| Search            | Find by name                        |
| Quick Edit        | Inline actions                      |
| Performance Stats | Per-listing metrics                 |
| Multi-View        | Grid and list layouts               |
| Pagination        | Navigate large collections          |
| Bulk Actions      | Mass updates (future)               |

### User Capabilities

- View all their listings
- Filter by status (active/inactive)
- Filter by category
- Search by name
- Sort listings (date, price, views)
- Quick toggle availability
- Navigate to edit page
- Delete listings
- See listing statistics
- Create new listing
- Duplicate listing (future)
- Export listing data (future)

### Filtering & Sorting

| Filter   | Options               |
| -------- | --------------------- |
| Status   | All, Active, Inactive |
| Category | All 8 categories      |
| Type     | Products, Services    |

| Sort       | Description         |
| ---------- | ------------------- |
| Newest     | Most recent first   |
| Oldest     | Earliest first      |
| Price High | Highest price first |
| Price Low  | Lowest price first  |
| Most Views | Popular first       |
| Low Stock  | Inventory alerts    |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ My Listings                    [+ Create New Listing]   │
├─────────────────────────────────────────────────────────┤
│ [All (45)] [Active (40)] [Inactive (5)]                 │
├─────────────────────────────────────────────────────────┤
│ Search: [_________________] Category: [All ▾] Sort: [▾] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Img] Product Name                                  │ │
│ │       RM 50.00 | Stock: 10 | ● Active               │ │
│ │       Views: 150 | Cart: 25 | Sales: 8              │ │
│ │       [👁 View] [✏️ Edit] [🔄 Toggle] [🗑️ Delete]   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Img] Another Product                               │ │
│ │       ...                                           │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│           [< Prev] [1] [2] [3] ... [10] [Next >]        │
└─────────────────────────────────────────────────────────┘
```

### Listing Card Information

| Field     | Description                   |
| --------- | ----------------------------- |
| Thumbnail | Primary image                 |
| Title     | Listing name                  |
| Price     | Current price                 |
| Stock     | Available quantity (products) |
| Status    | Active/Inactive badge         |
| Views     | Total page views              |
| Cart Adds | Times added to cart           |
| Sales     | Completed orders              |

### Quick Actions

| Action    | Icon | Description              |
| --------- | ---- | ------------------------ |
| View      | 👁️   | Open public listing page |
| Edit      | ✏️   | Navigate to edit form    |
| Toggle    | 🔄   | Switch active/inactive   |
| Delete    | 🗑️   | Remove with confirmation |
| Duplicate | 📋   | Clone listing (future)   |

### Low Stock Alerts

```
⚠️ Low Stock Warning
┌─────────────────────────────────────────┐
│ 3 products have low stock:              │
│ • Product A: 2 remaining                │
│ • Product B: 1 remaining                │
│ • Product C: 0 remaining (Out of Stock) │
│                        [View All]       │
└─────────────────────────────────────────┘
```

### Technical Implementation

| Feature         | Implementation                 |
| --------------- | ------------------------------ |
| Pagination      | Efficient limit/offset queries |
| Indexing        | MongoDB compound indexes       |
| Caching         | Redis for listing counts       |
| Real-time       | WebSocket stock updates        |
| Optimistic UI   | Instant toggle feedback        |
| Bulk Operations | Transaction support            |
| Export          | CSV/JSON generation            |
| Analytics       | Per-listing tracking           |

---

## API Endpoints

| Method   | Endpoint                      | Description             |
| -------- | ----------------------------- | ----------------------- |
| `POST`   | `/api/listings`               | Create new listing      |
| `GET`    | `/api/listings/my`            | Get merchant's listings |
| `GET`    | `/api/listings/:id`           | Get listing details     |
| `PATCH`  | `/api/listings/:id`           | Update listing          |
| `DELETE` | `/api/listings/:id`           | Delete listing          |
| `PATCH`  | `/api/listings/:id/toggle`    | Toggle availability     |
| `POST`   | `/api/listings/:id/duplicate` | Clone listing (future)  |

---

## Related Files

### Client-Side

- `client/src/pages/merchant/CreateListing.js` - Create form
- `client/src/pages/merchant/EditListing.js` - Edit form
- `client/src/pages/merchant/MyListings.js` - Listings dashboard
- `client/src/components/listings/` - Shared components
- `client/src/store/slices/listingSlice.js` - Redux state

### Server-Side

- `server/controllers/listing/` - Listing controllers
- `server/models/Listing.js` - Listing model
- `server/validators/listing.validator.js` - Validation rules
- `server/middleware/ownership.middleware.js` - Access control

---

[← Previous: Discovery](./02-discovery.md) | [Back to Index](./README.md) | [Next: Shopping Experience →](./04-shopping-experience.md)
