# Home & Discovery

> Home page, browsing listings, detail pages, and shop profiles

[← Back to Features Index](./README.md)

---

## Overview

The discovery system provides users with multiple ways to explore products and services on the platform, from the welcoming home page to detailed listing views and merchant shop profiles.

## Table of Contents

- [2.1 Home Page](#21-home-page)
- [2.2 Browse Listings](#22-browse-listings)
- [2.3 Listing Detail Page](#23-listing-detail-page)
- [2.4 Shop Profile Page](#24-shop-profile-page)

---

## 2.1 Home Page

**Purpose:** Welcome users and showcase platform offerings

**Page:** `/`

### Key Features

| Feature            | Description                             |
| ------------------ | --------------------------------------- |
| Hero Section       | Eye-catching banner with search and CTA |
| Featured Carousel  | Highlighted products and services       |
| Category Grid      | Quick access to all 8 categories        |
| Trending Items     | Popular listings showcase               |
| Merchant Spotlight | Featured seller shops                   |
| Recently Viewed    | Personalized for logged-in users        |
| Trust Indicators   | Security badges and testimonials        |
| Newsletter Signup  | Email subscription form                 |
| Responsive Design  | Optimized for all devices               |

### User Capabilities

- Browse featured listings without login
- Quick navigate to categories
- View promotional banners
- Access quick actions (browse, sell, shop)
- See platform statistics
- Read testimonials
- Search directly from hero section

### Page Sections

```
Home Page Layout:
┌─────────────────────────────────────────────┐
│              Hero Section                    │
│         [Search Bar + CTA Buttons]          │
├─────────────────────────────────────────────┤
│           Category Quick Access              │
│  [📚] [👕] [💻] [🎮] [📱] [🏠] [🎨] [🔧]  │
├─────────────────────────────────────────────┤
│           Featured Products                  │
│  [Card] [Card] [Card] [Card] →              │
├─────────────────────────────────────────────┤
│           Trending Items                     │
│  [Card] [Card] [Card] [Card] →              │
├─────────────────────────────────────────────┤
│           Merchant Spotlight                 │
│  [Shop Card] [Shop Card] [Shop Card]        │
├─────────────────────────────────────────────┤
│           Trust & Benefits                   │
│  [✓ Secure] [✓ Verified] [✓ Support]       │
├─────────────────────────────────────────────┤
│           Newsletter Signup                  │
├─────────────────────────────────────────────┤
│              Footer                          │
└─────────────────────────────────────────────┘
```

### Categories

| Icon | Category      | Description                |
| ---- | ------------- | -------------------------- |
| 📚   | Books & Notes | Textbooks, study materials |
| 👕   | Fashion       | Clothing, accessories      |
| 💻   | Electronics   | Devices, gadgets           |
| 🎮   | Gaming        | Games, consoles            |
| 📱   | Mobile        | Phones, tablets            |
| 🏠   | Home & Living | Dorm essentials            |
| 🎨   | Art & Crafts  | Handmade items             |
| 🔧   | Services      | Tutoring, repairs          |

### Technical Implementation

| Component       | Technology                           |
| --------------- | ------------------------------------ |
| SSR Compatible  | Next.js ready architecture           |
| Image Loading   | Lazy loading with placeholders       |
| Data Fetching   | API calls for dynamic content        |
| Caching         | Redis for category and featured data |
| Analytics       | Interaction tracking                 |
| Personalization | Role-based content display           |

---

## 2.2 Browse Listings

**Purpose:** Allow users to discover all products and services

**Pages:** `/browse`, `/listings`, `/products`, `/services`

### Key Features

| Feature            | Description                      |
| ------------------ | -------------------------------- |
| Type Toggle        | Switch between products/services |
| Advanced Filtering | Multiple filter criteria         |
| Multi-Sort Options | Price, date, popularity, rating  |
| View Modes         | Grid and list layouts            |
| Pagination         | Page-based navigation            |
| Quick View         | Preview without leaving page     |
| Direct Actions     | Add to cart/wishlist buttons     |
| Price Range Slider | Min-max price filter             |
| Search Within      | Filter current results           |

### Filtering Options

| Filter       | Options                   |
| ------------ | ------------------------- |
| Type         | Product, Service          |
| Category     | All 8 categories          |
| Price        | Min-max range slider      |
| Availability | In stock, out of stock    |
| Merchant     | Verified only             |
| Campus       | Filter by location        |
| Condition    | New, Used (products only) |

### Sorting Options

| Sort               | Description                    |
| ------------------ | ------------------------------ |
| Newest First       | Most recent listings (default) |
| Oldest First       | Earliest listings              |
| Price: Low to High | Ascending price                |
| Price: High to Low | Descending price               |
| Most Popular       | By view/purchase count         |
| Best Rated         | By average rating              |

### User Capabilities

- Switch between products and services
- Apply multiple filters simultaneously
- Sort by various criteria
- View as grid or list
- Quick preview without leaving page
- Add items to cart directly
- Save items to wishlist
- Navigate through pages
- See total results count
- Clear all filters quickly
- Bookmark filtered searches (URL-based)

### Listing Card Components

```
┌────────────────────────┐
│      [Image]           │
├────────────────────────┤
│ Title                  │
│ RM XX.XX              │
│ ┌────────┐            │
│ │Category│ ● In Stock │
│ └────────┘            │
│ Seller: Shop Name     │
├────────────────────────┤
│ [🛒 Cart] [❤ Wishlist]│
└────────────────────────┘
```

### Technical Implementation

| Feature          | Implementation                       |
| ---------------- | ------------------------------------ |
| URL State        | Query parameters for shareability    |
| Search Input     | Debounced (300ms)                    |
| Image Loading    | Lazy load with IntersectionObserver  |
| List Performance | Virtualized for large datasets       |
| Caching          | Redis for common filter combinations |
| Search Engine    | Elasticsearch integration (future)   |
| Analytics        | Popular filter tracking              |
| Layout           | Responsive CSS Grid                  |

---

## 2.3 Listing Detail Page

**Purpose:** Display comprehensive product/service information

**Page:** `/listings/:id`

### Key Features

| Feature          | Description                |
| ---------------- | -------------------------- |
| Full Information | Complete listing details   |
| Image Gallery    | Multiple images with zoom  |
| Seller Card      | Shop info and reputation   |
| Similar Items    | Related listings carousel  |
| Cart Integration | Add to cart with quantity  |
| Wishlist Option  | Save for later             |
| Share Buttons    | Social media sharing       |
| Report Option    | Flag inappropriate content |
| Breadcrumbs      | Navigation trail           |
| View Tracking    | Count page visits          |

### User Capabilities

- View all listing details
- Zoom and view multiple images
- Read full description
- See price and availability
- Check seller reputation
- View seller's other items
- Add desired quantity to cart
- Save to wishlist for later
- Share on social media
- Contact seller (future)
- Report inappropriate content
- Navigate back to browse

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Home > Category > Listing Title                          │
├───────────────────────┬─────────────────────────────────┤
│                       │                                  │
│   [Image Gallery]     │  Title                          │
│                       │  RM XX.XX                       │
│   [Thumbnail Strip]   │  ● In Stock (XX available)      │
│                       │                                  │
│                       │  Category: [Badge]              │
│                       │  Type: [Product/Service]        │
│                       │                                  │
│                       │  ┌─────────────────────────┐    │
│                       │  │ Quantity: [- 1 +]       │    │
│                       │  │ [Add to Cart]           │    │
│                       │  │ [Add to Wishlist]       │    │
│                       │  └─────────────────────────┘    │
├───────────────────────┴─────────────────────────────────┤
│                    Description                           │
│ Full listing description text...                        │
├─────────────────────────────────────────────────────────┤
│                    Seller Info                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Logo] Shop Name ✓                                  │ │
│ │ ★★★★☆ (4.5) | 150 sales | Member since 2024       │ │
│ │ Response time: < 1 hour                             │ │
│ │ [View Shop] [Contact Seller]                        │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Similar Listings                        │
│ [Card] [Card] [Card] [Card] →                           │
├─────────────────────────────────────────────────────────┤
│ [Share: 📘 🐦 📧] [🚩 Report]                           │
└─────────────────────────────────────────────────────────┘
```

### Image Gallery Features

| Feature         | Description            |
| --------------- | ---------------------- |
| Max Images      | Up to 10 per listing   |
| Thumbnail Strip | Quick navigation       |
| Zoom            | Click to enlarge       |
| Lightbox        | Full-screen view       |
| Swipe           | Mobile gesture support |
| Lazy Loading    | Progressive image load |

### Technical Implementation

| Feature       | Implementation                  |
| ------------- | ------------------------------- |
| SEO           | Friendly URLs, meta tags        |
| Open Graph    | Social sharing previews         |
| Breadcrumbs   | Dynamic generation              |
| Images        | S3 with CDN optimization        |
| View Count    | Atomic increment operation      |
| Caching       | Redis for popular items         |
| Related Items | Category + popularity algorithm |

---

## 2.4 Shop Profile Page

**Purpose:** Display merchant's shop with all their listings

**Page:** `/merchants/:shopSlug`

### Key Features

| Feature            | Description                   |
| ------------------ | ----------------------------- |
| Shop Branding      | Logo and banner display       |
| Shop Statistics    | Products, sales, rating       |
| Listings Grid      | All shop products/services    |
| Description        | About the shop                |
| Verification Badge | Trust indicator               |
| Rating & Reviews   | Customer feedback             |
| Follow Button      | Updates subscription (future) |
| Contact Button     | Message merchant (future)     |
| View Tracking      | Shop visit analytics          |

### User Capabilities

- Browse all shop listings
- View shop information
- See shop statistics
- Check verification status
- View merchant rating
- Filter shop listings
- Sort shop items
- Visit individual listings
- Follow shop for updates (future)
- Message merchant (future)

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│                   [Banner Image]                         │
│    ┌──────┐                                             │
│    │ Logo │  Shop Name ✓                                │
│    └──────┘  "Shop description goes here..."            │
├─────────────────────────────────────────────────────────┤
│ ┌───────────┬───────────┬───────────┬───────────┐       │
│ │ Products  │ Total     │ Member    │ Rating    │       │
│ │    45     │ Sales 120 │ Since 24  │ ★★★★☆    │       │
│ └───────────┴───────────┴───────────┴───────────┘       │
├─────────────────────────────────────────────────────────┤
│ [All] [Products] [Services] | Sort: [Newest ▾]          │
├─────────────────────────────────────────────────────────┤
│ [Card] [Card] [Card] [Card]                             │
│ [Card] [Card] [Card] [Card]                             │
│                                                          │
│             [1] [2] [3] ... [Next]                       │
└─────────────────────────────────────────────────────────┘
```

### Shop Statistics

| Stat           | Description          |
| -------------- | -------------------- |
| Total Products | Active listing count |
| Total Sales    | Completed orders     |
| Member Since   | Registration date    |
| Average Rating | Customer reviews     |
| Response Time  | Reply speed (future) |

### Technical Implementation

| Feature       | Implementation             |
| ------------- | -------------------------- |
| SEO           | Optimized shop pages       |
| Slug          | URL-safe shop identifier   |
| Caching       | Redis for shop data        |
| Queries       | Optimized listing fetch    |
| Analytics     | Visitor tracking           |
| Related Shops | Suggestion algorithm       |
| Sharing       | Social share functionality |

---

## API Endpoints

| Method | Endpoint                        | Description           |
| ------ | ------------------------------- | --------------------- |
| `GET`  | `/api/listings`                 | Browse all listings   |
| `GET`  | `/api/listings/:id`             | Get listing details   |
| `GET`  | `/api/listings/featured`        | Get featured listings |
| `GET`  | `/api/listings/trending`        | Get trending listings |
| `GET`  | `/api/merchants/:slug`          | Get shop profile      |
| `GET`  | `/api/merchants/:slug/listings` | Get shop listings     |
| `GET`  | `/api/categories`               | Get all categories    |
| `POST` | `/api/listings/:id/view`        | Track listing view    |

---

## Related Files

### Client-Side

- `client/src/pages/Home.js` - Home page component
- `client/src/pages/Browse.js` - Browse listings page
- `client/src/pages/ListingDetail.js` - Listing detail page
- `client/src/pages/ShopProfile.js` - Shop profile page
- `client/src/components/listings/` - Listing components

### Server-Side

- `server/controllers/listing/` - Listing controllers
- `server/models/Listing.js` - Listing model
- `server/routes/listing.routes.js` - Listing routes

---

[← Previous: Authentication](./01-authentication.md) | [Back to Index](./README.md) | [Next: Listing Management →](./03-listing-management.md)
