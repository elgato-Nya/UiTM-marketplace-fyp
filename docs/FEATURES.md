# UiTM Marketplace - Feature Documentation

> Comprehensive guide to all platform features, modules, and capabilities

## 📚 Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Home & Discovery](#2-home--discovery)
3. [Listing Management](#3-listing-management)
4. [Shopping Experience](#4-shopping-experience)
5. [Checkout & Payment](#5-checkout--payment)
6. [Order Management](#6-order-management)
7. [Profile Management](#7-profile-management)
8. [Merchant Features](#8-merchant-features)
9. [Analytics Dashboard](#9-analytics-dashboard)
10. [Admin Panel](#10-admin-panel)
11. [Search & Filtering](#11-search--filtering)
12. [Notifications](#12-notifications)

---

## 1. Authentication & User Management

### 1.1 User Registration

**Purpose:** Allow new users to create accounts with UiTM email validation

**Pages:** `/auth/register`

**Key Features:**

- UiTM email validation (must end with @uitm.edu.my)
- Password strength requirements (8-24 characters, uppercase, lowercase, number, special char)
- Automatic username generation from email
- Campus and faculty selection
- Phone number validation (Malaysian format)
- Role selection (Consumer by default, Merchant optional)
- Form validation with real-time feedback
- Duplicate prevention for email, username, phone number

**User Can:**

- Fill registration form with personal details
- Choose campus from dropdown (Shah Alam, Puncak Alam, etc.)
- Select faculty from available options
- Set secure password
- Agree to terms and conditions
- Submit registration
- Receive confirmation and redirect to login

**Technical Implementation:**

- Client-side validation with `react-hook-form`
- Server-side validation with `express-validator`
- Password hashing with bcrypt (12 salt rounds)
- Email uniqueness check in MongoDB
- Automatic timestamp creation (createdAt, updatedAt)

**Security:**

- HTTPS encryption for data transmission
- Password never stored in plaintext
- Email verification token generation (future enhancement)
- Rate limiting on registration endpoint

---

### 1.2 User Login

**Purpose:** Authenticate existing users and establish session

**Pages:** `/auth/login`

**Key Features:**

- Email and password authentication
- "Remember me" functionality
- Session management with JWT tokens
- Dual-token strategy (access token + refresh token)
- Automatic session restoration
- Redirect to previous page after login
- Token expiration handling
- Secure cookie storage for refresh tokens

**User Can:**

- Enter email and password
- Choose to stay logged in
- See helpful error messages
- Reset password (if forgotten)
- Be redirected to intended destination after login
- Access role-specific features immediately

**User Gains:**

- Personalized experience
- Access to cart and wishlist
- Ability to make purchases
- Order history tracking
- Profile customization
- Role-based features (merchant dashboard, admin panel)

**Technical Implementation:**

- JWT access tokens (30-minute expiry)
- JWT refresh tokens (7-day expiry, HTTP-only cookies)
- Redux state management for auth
- Automatic token refresh on 401 errors
- Session restoration on page reload
- Protected route components

**Security:**

- Bcrypt password comparison
- Constant-time comparison to prevent timing attacks
- Rate limiting (5 attempts per 15 minutes)
- IP tracking for suspicious activity
- Secure cookie flags (httpOnly, secure, sameSite)
- Token invalidation on logout

---

### 1.3 Password Management

**Purpose:** Allow users to recover and reset forgotten passwords

**Pages:** `/auth/forgot-password`, `/auth/reset-password`

**Key Features:**

- Email-based password reset
- Secure reset token generation
- Token expiration (15 minutes)
- Password strength validation
- Reset confirmation email

**User Can:**

- Request password reset via email
- Receive reset link
- Set new password
- Confirm password reset
- Login with new credentials

**Technical Implementation:**

- Cryptographically secure random tokens
- Token hashing before database storage
- Email service integration
- Token expiration tracking
- Rate limiting on reset requests

---

### 1.4 Session Management

**Purpose:** Maintain user authentication across browser sessions

**Key Features:**

- Automatic session restoration on page load
- Token refresh before expiration
- Multi-device support
- Logout from all devices option
- Session timeout handling
- Idle session detection

**User Can:**

- Stay logged in across browser sessions
- Use multiple devices simultaneously
- Manually logout
- See session expiration warnings
- Refresh session without re-login

**Technical Implementation:**

- Redux persist for client-side state
- HTTP-only cookies for refresh tokens
- Token refresh interceptor in Axios
- Session validation on critical operations
- Refresh token rotation for security

---

## 2. Home & Discovery

### 2.1 Home Page

**Purpose:** Welcome users and showcase platform offerings

**Pages:** `/`

**Key Features:**

- Hero section with call-to-action
- Featured products and services carousel
- Category quick access grid
- Trending items showcase
- Merchant spotlight section
- Recently viewed items (for logged-in users)
- Trust indicators and testimonials
- Newsletter signup
- Responsive design for all devices

**User Can:**

- Browse featured listings without login
- Quick navigate to categories
- View promotional banners
- Access quick actions (browse, sell, shop)
- See platform statistics
- Read testimonials
- Search directly from hero section

**User Sees:**

- Hero banner with search bar
- 8 main categories with icons
- 4 featured products/services
- 4 trending items
- Highlighted merchant shops
- Trust badges (secure payments, verified merchants)
- Platform benefits
- Newsletter subscription form
- Footer with links and information

**Technical Implementation:**

- Server-side rendering compatible
- Lazy loading for images
- Infinite scroll for listings
- API calls for featured items
- Cached category data
- Dynamic content based on user role
- Analytics tracking for interactions

---

### 2.2 Browse Listings

**Purpose:** Allow users to discover all products and services

**Pages:** `/browse`, `/listings`, `/products`, `/services`

**Key Features:**

- Unified browse page with type toggle
- Advanced filtering system
- Multi-criteria sorting
- Grid and list view options
- Pagination with page numbers
- Quick view modal
- Add to cart/wishlist buttons
- Price range slider
- Category filters
- Availability filters
- Search within results
- Recently viewed tracking

**User Can:**

- Switch between products and services
- Apply multiple filters simultaneously
- Sort by price, date, popularity, rating
- View as grid or list
- Quick preview without leaving page
- Add items to cart directly
- Save items to wishlist
- Navigate through pages easily
- See total results count
- Clear all filters quickly
- Bookmark filtered searches

**Filtering Options:**

- By Type: Product or Service
- By Category: All 8 categories
- By Price: Min-max range slider
- By Availability: In stock, out of stock
- By Merchant: Verified only
- By Campus: Filter by location
- By Condition: New, used (for products)

**Sorting Options:**

- Newest first (default)
- Oldest first
- Price: Low to high
- Price: High to low
- Most popular
- Best rated

**User Sees:**

- Filter sidebar (desktop) or modal (mobile)
- Listing cards with:
  - Product image
  - Title
  - Price
  - Category badge
  - Availability status
  - Seller info
  - Quick action buttons
- Pagination controls
- Active filters chips
- Results count
- Empty state if no matches

**Technical Implementation:**

- URL query parameters for shareability
- Debounced search input
- Lazy loading for images
- Virtualized list for performance
- Redis caching for common filters
- Elasticsearch integration (future)
- Analytics for popular filters
- Responsive grid system

---

### 2.3 Listing Detail Page

**Purpose:** Display comprehensive product/service information

**Pages:** `/listings/:id`

**Key Features:**

- Full listing information display
- Image gallery with zoom
- Seller information card
- Similar items carousel
- Add to cart functionality
- Add to wishlist option
- Share listing button
- Report listing option
- Breadcrumb navigation
- View count tracking
- Responsive image gallery

**User Can:**

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

**User Sees:**

- Image gallery (up to 10 images)
- Listing title and price
- Category and type badges
- Stock availability (for products)
- Detailed description
- Seller card with:
  - Shop name and logo
  - Verification badge
  - Rating and reviews
  - Total sales
  - Response time
- Similar listings (4 items)
- Add to cart/wishlist buttons
- Quantity selector (for products)
- Share buttons
- Report button

**Technical Implementation:**

- SEO-friendly URLs
- Open Graph meta tags
- Dynamic breadcrumbs
- Image optimization
- Lazy loading for similar items
- View count increment
- Redis caching for popular items
- Analytics tracking
- Related items algorithm

---

### 2.4 Shop Profile Page

**Purpose:** Display merchant's shop with all their listings

**Pages:** `/merchants/:shopSlug`

**Key Features:**

- Shop branding display
- Shop statistics
- All shop listings grid
- Shop description
- Verification status
- Rating and reviews
- Follow shop button (future)
- Contact shop button
- View tracking

**User Can:**

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

**User Sees:**

- Shop banner image
- Shop logo
- Shop name and description
- Verification badge
- Shop statistics:
  - Total products
  - Total sales
  - Member since
  - Average rating
- Listings grid
- Shop categories
- Sort and filter options

**Technical Implementation:**

- SEO-optimized shop pages
- Cached shop data
- Optimized listing queries
- View count tracking
- Analytics for shop visitors
- Related shops suggestion
- Share functionality

---

## 3. Listing Management

### 3.1 Create Listing

**Purpose:** Allow merchants to add new products/services

**Pages:** `/merchant/listings/create`

**Access:** Merchant role required

**Key Features:**

- Type selection (Product/Service)
- Multi-step form wizard
- Image upload (up to 10 images)
- Image preview and reorder
- Rich text description editor
- Category selection
- Price setting
- Stock management (products only)
- Availability toggle
- Draft save option
- Form validation
- Success confirmation

**User Can:**

- Choose listing type
- Enter listing details
- Upload multiple images
- Drag-and-drop image reorder
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

**Form Fields:**

- **Type:** Product or Service (radio)
- **Name:** 3-100 characters (required)
- **Description:** Up to 1000 characters
- **Price:** Positive number, RM (required)
- **Category:** Dropdown selection (required)
- **Images:** 1-10 images, max 5MB each (required)
- **Stock:** Number, only for products
- **Availability:** Boolean toggle

**User Sees:**

- Step indicator (if wizard)
- Form with clear labels
- Inline validation errors
- Image upload zone
- Image previews with delete option
- Character counters
- Price format helper
- Category icons
- Stock input (products only)
- Availability switch
- Save and publish buttons
- Cancel button
- Help text for each field

**Validation Rules:**

- Name: Required, 3-100 chars, no HTML
- Price: Required, positive number
- Category: Required, valid enum
- Images: At least 1, max 10, valid formats
- Description: Max 1000 chars, sanitized
- Stock: Non-negative integer (products)

**Technical Implementation:**

- Multi-part form data for images
- S3 direct upload for images
- Image compression before upload
- Optimistic UI updates
- Form state management with Redux
- Draft autosave (localStorage)
- Upload progress indicators
- Error boundary for failures
- Success redirect to listings page

---

### 3.2 Edit Listing

**Purpose:** Allow merchants to update existing listings

**Pages:** `/merchant/listings/:id/edit`

**Access:** Merchant role + ownership verification

**Key Features:**

- Pre-filled form with existing data
- All create features available
- Image management (add/remove/reorder)
- Update availability status
- Update stock levels
- Price adjustment
- Delete listing option
- Change history (future)
- Preview changes

**User Can:**

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

**Additional Features:**

- Deletion confirmation dialog
- Listing analytics display
- Performance metrics
- Stock history (future)
- Price change history (future)

**User Sees:**

- Same form as create
- Existing data populated
- Current images displayed
- Stock level indicator
- Delete button (danger zone)
- Save changes button
- Cancel button
- Last updated timestamp

**Technical Implementation:**

- Optimistic updates
- Conflict resolution for concurrent edits
- Image URL caching
- Partial update API (PATCH)
- Ownership verification middleware
- Soft delete option
- Change tracking in database
- Audit log for edits

---

### 3.3 My Listings

**Purpose:** Merchant's listing management dashboard

**Pages:** `/merchant/listings`

**Access:** Merchant role required

**Key Features:**

- All merchant listings display
- Status filters (active, inactive)
- Category filters
- Search within listings
- Bulk actions (future)
- Quick edit options
- Performance metrics per listing
- Sort by various criteria
- Pagination
- List and grid views

**User Can:**

- View all their listings
- Filter by status
- Filter by category
- Search by name
- Sort listings
- Quick toggle availability
- Navigate to edit page
- Delete listings
- See listing statistics
- Create new listing
- Duplicate listing (future)
- Export listing data (future)

**User Sees:**

- Create new listing button
- Filter/sort toolbar
- Listing cards/rows with:
  - Primary image thumbnail
  - Title
  - Price
  - Stock level (products)
  - Status badge
  - Views count
  - Cart adds count
  - Quick actions (edit, delete, toggle)
- Pagination controls
- Empty state (if no listings)
- Loading skeletons

**Quick Actions:**

- Edit (pencil icon)
- Delete (trash icon)
- Toggle availability (switch)
- View on shop (eye icon)
- Duplicate (copy icon - future)

**Technical Implementation:**

- Efficient pagination queries
- Indexed database queries
- Cached listing counts
- Real-time stock updates
- Optimistic UI for quick actions
- Bulk operation support
- Export functionality
- Analytics tracking

---

## 4. Shopping Experience

### 4.1 Shopping Cart

**Purpose:** Temporary storage for items before checkout

**Pages:** `/cart`

**Access:** Login required

**Key Features:**

- Add items from listings
- View all cart items
- Update quantities
- Remove individual items
- Move items to wishlist
- Clear entire cart
- Price calculations
- Stock validation
- Availability checking
- Price change notifications
- Seller grouping
- Multi-merchant checkout support

**User Can:**

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

**User Sees:**

- Cart items list with:
  - Item image
  - Item name
  - Seller name
  - Price (with change indicator)
  - Quantity selector
  - Subtotal per item
  - Remove button
  - Move to wishlist button
- Cart summary card:
  - Items count
  - Subtotal
  - Estimated shipping
  - Total amount
  - Checkout button
- Empty cart state
- Stock warnings
- Unavailable item notices
- Price change alerts

**Cart Item Details:**

- Product image (clickable)
- Product name (clickable)
- Seller shop name (clickable)
- Original price
- Current price (if changed)
- Quantity selector (1-stock limit)
- Item subtotal
- Stock availability
- Action buttons

**Calculations:**

- Item subtotal = price × quantity
- Cart subtotal = sum of all items
- Shipping fee = varies by method
- Total = subtotal + shipping

**Technical Implementation:**

- Cart stored in MongoDB
- Real-time updates via WebSocket (future)
- Optimistic UI updates
- Stock validation on quantity change
- Price sync with listing prices
- Cart persistence across sessions
- Cart expiration (30 days inactive)
- Atomic cart operations
- Conflict resolution

**Validations:**

- Stock availability check
- Quantity limits
- Price consistency
- Seller status verification
- Item availability verification

---

### 4.2 Wishlist

**Purpose:** Save items for later purchase consideration

**Pages:** `/wishlist`

**Access:** Login required

**Key Features:**

- Save items from listings
- View all wishlist items
- Remove items
- Move items to cart
- Track price changes
- Stock availability alerts
- Sort and filter
- Share wishlist (future)
- Price drop notifications (future)

**User Can:**

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

**User Sees:**

- Wishlist items grid/list with:
  - Item image
  - Item name
  - Current price
  - Original price (when added)
  - Price change indicator
  - Stock status
  - Date added
  - Move to cart button
  - Remove button
- Item count
- Empty wishlist state
- Price drop badges
- Out of stock badges

**Price Tracking:**

- Price when added saved
- Current price displayed
- Percentage change calculated
- Visual indicator (up/down/same)
- Price history graph (future)

**Technical Implementation:**

- Wishlist stored in MongoDB
- Denormalized price data
- Scheduled price sync job
- Real-time stock checks
- Indexed queries for fast retrieval
- Pagination for large wishlists
- Price history tracking

---

## 5. Checkout & Payment

### 5.1 Checkout Process

**Purpose:** Complete purchase transaction

**Pages:** `/checkout`

**Access:** Login required + items in cart

**Key Features:**

- Multi-step checkout flow
- Address selection/creation
- Delivery method selection
- Payment method selection
- Order review
- Session management (10-minute timer)
- Stock reservation during checkout
- Stripe payment integration
- COD option for eligible amounts
- Order confirmation

**Checkout Steps:**

#### Step 1: Delivery Address

- Select from saved addresses
- Add new address inline
- Edit existing address
- Validate address completeness
- Support campus/personal/pickup types

#### Step 2: Delivery Method

- Choose delivery option:
  - Standard Delivery
  - Express Delivery
  - Campus Pickup
  - Meet-up Point
- View delivery fee
- See estimated delivery time
- Special instructions field

#### Step 3: Payment Method

- Select payment type:
  - Online Payment (Stripe)
  - Cash on Delivery (COD)
- For Online Payment:
  - Enter card details (Stripe Elements)
  - Save card option (future)
  - 3D Secure authentication
- For COD:
  - Confirmation required
  - Amount limits apply

#### Step 4: Review & Confirm

- Review all details
- See order summary
- Check items one last time
- Accept terms and conditions
- Place order button

**User Can:**

- Navigate between steps
- Edit any step before confirmation
- See real-time price calculations
- Track session timer
- Save progress temporarily
- Cancel checkout anytime
- Add new address during checkout
- Switch between payment methods
- Apply promo codes (future)
- See order summary throughout

**User Sees:**

- Step indicator (1/2/3/4)
- Session countdown timer
- Current step content
- Order summary sidebar:
  - Items list
  - Subtotal
  - Shipping fee
  - Platform fee
  - Total amount
- Next/Back buttons
- Cancel button
- Security badges
- Help text

**Session Management:**

- 10-minute session timeout
- Stock reserved for session duration
- Warning at 2 minutes remaining
- Automatic stock release on expiration
- Session renewal option

**Payment Processing:**

- Stripe payment intents
- Secure card handling
- 3D Secure support
- Payment confirmation
- Error handling
- Retry mechanism
- Payment status tracking

**Technical Implementation:**

- Redux state for checkout data
- Session stored in backend
- Stripe SDK integration
- WebSocket for real-time updates
- Atomic stock operations
- Transaction support
- Payment webhook handling
- Email confirmation
- Order creation on success

---

### 5.2 Checkout Success

**Purpose:** Confirm successful order placement

**Pages:** `/checkout/success`

**Access:** Post-checkout redirect

**Key Features:**

- Order confirmation message
- Order number display
- Order details summary
- Payment confirmation
- Download receipt button
- Track order button
- Continue shopping button
- Email confirmation sent

**User Sees:**

- Success animation/checkmark
- Order number
- Order summary
- Payment method used
- Delivery address
- Estimated delivery date
- Next steps instructions
- Action buttons
- Seller contact info

**User Can:**

- View order details
- Download receipt PDF
- Track order status
- Return to shopping
- View order history
- Contact seller
- Share order status

**Technical Implementation:**

- Query params for order ID
- Order data fetching
- PDF generation for receipt
- Email queue for confirmation
- Analytics event tracking
- Cart clearing
- Session cleanup

---

## 6. Order Management

### 6.1 Purchase Orders (Buyer View)

**Purpose:** View and manage orders as a buyer

**Pages:** `/orders/purchases`

**Access:** Login required

**Key Features:**

- All purchase orders list
- Status-based filtering
- Date range filtering
- Search by order number
- Order status badges
- Quick actions
- Pagination
- Order details view
- Cancel order option
- Track shipment

**User Can:**

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

**User Sees:**

- Order list with cards showing:
  - Order number
  - Order date
  - Seller info
  - Items count
  - Total amount
  - Status badge
  - Quick view button
- Status filter tabs with counts
- Search bar
- Sort dropdown
- Pagination controls
- Empty state

**Order Status Flow:**

```
Pending → Confirmed → Shipped → Delivered → Completed
         ↓
      Cancelled (buyer can cancel at pending/confirmed)
```

**User Can Cancel:**

- When status is "pending" (before seller confirms)
- When status is "confirmed" (with reason)
- Not after "shipped" status

**Technical Implementation:**

- Efficient order queries
- Status indexes
- Real-time status updates
- Cancellation workflow
- Notification triggers
- Analytics tracking
- Export functionality

---

### 6.2 Sales Orders (Seller View)

**Purpose:** Manage orders as a merchant

**Pages:** `/merchant/orders`

**Access:** Merchant role required

**Key Features:**

- All sales orders list
- Status-based filtering
- Urgent orders highlighting
- Bulk status updates (future)
- Order management actions
- Performance metrics
- Sales analytics
- Export orders

**User Can:**

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

**User Sees:**

- Order list with:
  - Order number
  - Order date
  - Buyer info
  - Items summary
  - Total amount
  - Status badge
  - Action buttons
- Urgent orders badge/indicator
- Status filter tabs
- Quick actions toolbar
- Sales summary cards
- Empty state

**Seller Actions by Status:**

- **Pending:** Confirm or Cancel order
- **Confirmed:** Mark as shipped (add tracking)
- **Shipped:** Mark as delivered
- **Delivered:** Mark as completed (auto after 3 days)
- **Completed:** Leave feedback, view analytics

**Tracking Information:**

- Carrier name
- Tracking number
- Tracking URL
- Estimated delivery date
- Notes for buyer

**Technical Implementation:**

- Seller-specific queries
- Status transition validation
- Notification system
- Analytics integration
- Bulk operations support
- Export functionality
- Performance monitoring

---

### 6.3 Order Detail Page

**Purpose:** Display comprehensive order information

**Pages:** `/orders/:id`

**Access:** Order participant (buyer/seller) or admin

**Key Features:**

- Complete order information
- Dual perspective (buyer/seller view)
- Status timeline
- Item details
- Buyer/seller information
- Delivery address
- Payment details
- Action buttons based on role
- Status history
- Order notes
- Communication thread (future)

**User Can:**

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

**User Sees:**

- Order header:
  - Order number
  - Order date
  - Status badge
  - Total amount
- Items section:
  - Product images
  - Names and quantities
  - Individual prices
  - Subtotals
- Buyer/Seller info card:
  - Name
  - Email
  - Phone
  - Shop name (seller)
- Delivery address:
  - Full address
  - Recipient name
  - Phone number
  - Delivery instructions
- Payment section:
  - Payment method
  - Payment status
  - Transaction ID
  - Payment date
- Status timeline:
  - All status changes
  - Timestamps
  - Updated by
  - Notes
- Action buttons (role-based)

**Buyer Actions:**

- Cancel order (if eligible)
- Contact seller
- Report issue
- Leave review (after delivered)
- Download receipt
- Reorder items

**Seller Actions:**

- Confirm order
- Add tracking info
- Mark as shipped
- Mark as delivered
- Add order notes
- Contact buyer
- Generate invoice

**Technical Implementation:**

- Unified component for both roles
- Role-based rendering
- Real-time updates (WebSocket)
- Status validation
- Timeline generation
- PDF generation
- Print optimization

---

## 7. Profile Management

### 7.1 User Profile

**Purpose:** View and edit personal information

**Pages:** `/profile`

**Access:** Login required

**Key Features:**

- Profile information display
- Avatar upload and management
- Inline field editing
- Account statistics
- Role badges
- Email verification status
- Last active timestamp
- Profile completion indicator

**User Can:**

- View profile details
- Update avatar image
- Edit username (with availability check)
- Edit bio (250 chars max)
- Edit phone number
- Change campus selection
- Update faculty
- See account statistics:
  - Member since
  - Total orders (buyer)
  - Total sales (merchant)
  - Rating
  - Verification status
- Navigate to other profile sections

**User Sees:**

- Avatar with upload button
- Profile card with:
  - Username
  - Email (verified badge)
  - Bio
  - Phone number
  - Campus
  - Faculty
- Role badges (Consumer/Merchant/Admin)
- Account stats cards
- Quick links:
  - Addresses
  - Security
  - Settings
  - Orders
  - Merchant Dashboard (if applicable)
- Last active timestamp

**Editable Fields:**

- Avatar image (crop and resize)
- Username (unique, 4-15 chars)
- Bio (max 250 chars)
- Phone number (Malaysian format)
- Campus (dropdown)
- Faculty (dropdown)

**Non-Editable Fields:**

- Email (requires verification to change)
- Member since date
- Account ID
- Role (requires admin)

**Technical Implementation:**

- Inline editing with validation
- Optimistic UI updates
- Image upload to S3
- Image cropping tool
- Debounced username availability check
- Profile completion calculation
- Real-time updates
- Audit logging

---

### 7.2 Address Management

**Purpose:** Manage delivery and billing addresses

**Pages:** `/profile/addresses`

**Access:** Login required

**Key Features:**

- Multiple address types support
- Add new addresses
- Edit existing addresses
- Delete addresses
- Set default address per type
- Address validation
- Campus/Personal/Pickup options
- Quick selection in checkout

**Address Types:**

#### Campus Address

- Campus selection
- Building name
- Floor
- Room/Unit number
- Special instructions

#### Personal Address

- Street address (line 1 & 2)
- City
- State
- Postcode
- Country (Malaysia default)

#### Pickup Point

- Location description
- Pickup time preference
- Contact instructions

**User Can:**

- Add new address (any type)
- View all saved addresses
- Edit any address
- Delete addresses (except default)
- Set default per type
- Validate address format
- Use address in checkout
- Label addresses (Home, Dorm, etc.)

**User Sees:**

- Add address button
- Address cards displaying:
  - Address type badge
  - Label/nickname
  - Full formatted address
  - Recipient name and phone
  - Default badge (if default)
  - Edit button
  - Delete button
  - Set as default button
- Address type tabs/filters
- Empty state (if no addresses)

**Validations:**

- Required fields per type
- Phone number format
- Postcode format (5 digits)
- Building/room validation
- Pickup time in future

**Technical Implementation:**

- Embedded documents in User model
- Type-based conditional validation
- Default address logic
- Address formatting utilities
- Geocoding integration (future)
- Address autocomplete (future)

---

### 7.3 Security Settings

**Purpose:** Manage account security (Future enhancement)

**Pages:** `/profile/security`

**Access:** Login required

**Planned Features:**

- Change password
- Two-factor authentication
- Active sessions management
- Login history
- Trusted devices
- Security notifications
- Account deactivation

---

## 8. Merchant Features

### 8.1 Merchant Dashboard

**Purpose:** Central hub for merchant operations

**Pages:** `/merchant/dashboard`

**Access:** Merchant role required

**Key Features:**

- Analytics overview
- Quick statistics
- Revenue charts
- Sales trends
- Order management
- Performance metrics
- Quick actions
- Recent activity

**User Sees:**

- Welcome message with shop name
- Key metrics cards:
  - Total Revenue (with growth %)
  - Total Sales (order count)
  - Average Order Value
  - Active Listings count
- Revenue chart (line/bar)
- Order status distribution (pie chart)
- Recent orders table (last 10)
- Quick action buttons:
  - Create new listing
  - View all orders
  - Manage shop
  - View analytics
- Low stock alerts
- Pending orders notification
- Performance indicators

**Metrics Displayed:**

- Today's sales
- This week's revenue
- This month's revenue
- Year to date
- Growth percentages
- Comparison to previous period

**Technical Implementation:**

- Pre-calculated analytics
- Scheduled aggregation jobs (every 15 mins)
- Redis caching
- Real-time order updates
- Lazy loading for charts
- Export functionality
- Mobile-responsive charts

---

### 8.2 Shop Management

**Purpose:** Manage merchant shop settings

**Pages:** `/merchant/store`

**Access:** Merchant role required

**Key Features:**

- Shop information editing
- Branding upload (logo, banner)
- Shop description
- Shop slug customization
- Shop statistics display
- Verification status
- Shop preview
- SEO settings

**User Can:**

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

**User Sees:**

- Shop info form:
  - Shop name field
  - Description textarea
  - Shop slug field (URL preview)
- Branding section:
  - Logo uploader (square, max 2MB)
  - Banner uploader (wide, max 5MB)
  - Preview thumbnails
- Shop statistics:
  - Total products
  - Total sales
  - Total revenue
  - Shop views
  - Average rating
- Verification status badge
- Save changes button
- View shop button (opens public page)

**Shop Slug:**

- Auto-generated from shop name
- URL-safe (lowercase, hyphens)
- Unique across platform
- Customizable with availability check
- Used in shop URL: `/merchants/{slug}`

**Validations:**

- Shop name: 3-50 characters
- Description: max 500 characters
- Slug: 3-30 characters, alphanumeric + hyphens
- Logo: square aspect ratio, max 2MB
- Banner: 16:9 aspect ratio, max 5MB

**Technical Implementation:**

- Auto-shop creation on first visit
- Profile data pre-fill
- Image upload to S3
- Slug uniqueness check
- Real-time preview
- Analytics integration
- SEO meta tags generation

---

### 8.3 Merchant Verification (Future)

**Purpose:** Verify merchant legitimacy

**Planned Features:**

- Upload verification documents
- Business registration number
- Identity verification
- Tax ID submission
- Bank account verification
- Review and approval process
- Verification badge on shop

---

## 9. Analytics Dashboard

### 9.1 Merchant Analytics

**Purpose:** Detailed business insights for merchants

**Pages:** `/merchant/analytics`

**Access:** Merchant role required

**Key Features:**

- Revenue analytics
- Sales analytics
- Product performance
- Customer insights
- Time-based filtering (week/month/year)
- Trend analysis
- Top products
- Category breakdown
- Export reports

**Analytics Sections:**

#### Revenue Overview

- Total revenue (all time)
- Revenue by period
- Revenue trend chart
- Growth percentage
- Average order value
- Revenue by category
- Best performing day
- Worst performing day

#### Sales Metrics

- Total sales count
- Sales trend over time
- Sales by status
- Completion rate
- Cancellation rate
- Average items per order
- Repeat customer rate (future)

#### Product Performance

- Top selling products (by units)
- Top earning products (by revenue)
- Low stock alerts
- Out of stock items
- Product views
- Cart additions
- Conversion rate per product
- Category performance

#### Order Analysis

- Order status distribution
- Pending orders count
- Orders by delivery method
- Orders by payment method
- Average processing time
- Average delivery time

**User Can:**

- Select time period (week/month/year)
- View all metrics for period
- Compare with previous period
- Export data as CSV/PDF
- See trends and patterns
- Identify best sellers
- Track business growth
- Make data-driven decisions
- Refresh analytics manually

**User Sees:**

- Period selector (tabs or dropdown)
- Summary cards (4-6 key metrics)
- Revenue chart (line/area chart)
- Order chart (bar/pie chart)
- Top products table
- Category breakdown pie chart
- Refresh button
- Export button
- Last updated timestamp
- Loading states for data

**Charts:**

- Revenue over time (line chart)
- Orders by status (pie/donut chart)
- Sales trend (bar chart)
- Category breakdown (pie chart)
- Top products (horizontal bar)

**Technical Implementation:**

- Pre-aggregated data model
- Scheduled calculation jobs
- MongoDB aggregation pipelines
- Chart.js or Recharts library
- Redis caching for performance
- Real-time updates option
- Export service
- Mobile-responsive charts

---

### 9.2 Platform Analytics (Admin)

**Purpose:** System-wide analytics for administrators (Future)

**Planned Features:**

- Total platform revenue
- Total transactions
- Active users
- New registrations
- Popular categories
- Merchant performance
- User activity
- System health metrics

---

## 10. Admin Panel

### 10.1 Admin Dashboard (Future Enhancement)

**Purpose:** Platform administration and monitoring

**Pages:** `/admin/dashboard`

**Access:** Admin role required

**Planned Features:**

- Platform overview
- User statistics
- Transaction monitoring
- Revenue tracking
- System health
- Active sessions
- Error logs
- Performance metrics

---

### 10.2 User Management (Future)

**Purpose:** Manage all platform users

**Pages:** `/admin/users`

**Planned Features:**

- User list with search
- Filter by role/status
- User detail view
- Edit user information
- Suspend/activate accounts
- Role management
- Merge duplicate accounts
- Password reset for users
- Verification management
- Activity logs

---

### 10.3 Content Moderation (Future)

**Planned Features:**

- Review reported listings
- Review reported shops
- Review reported users
- Content approval workflow
- Takedown inappropriate content
- Warning system
- Ban management

---

### 10.4 Platform Settings (Future)

**Planned Features:**

- General settings
- Payment configuration
- Email templates
- Feature toggles
- Maintenance mode
- Announcement management
- Terms and policies

---

## 11. Search & Filtering

### 11.1 Global Search

**Purpose:** Find listings across the platform

**Features:**

- Full-text search
- Auto-suggestions
- Recent searches
- Popular searches
- Search history
- Advanced filters
- Sort options

**User Can:**

- Search by keyword
- See search suggestions
- Filter results
- Sort results
- Save searches (future)
- Share search results

**Technical Implementation:**

- MongoDB text indexes
- Elasticsearch integration (future)
- Search analytics
- Typo tolerance
- Synonym support
- Relevance scoring

---

### 11.2 Filtering System

**Purpose:** Refine search and browse results

**Filter Types:**

- Category filters (8 categories)
- Price range (slider)
- Type (product/service)
- Availability (in stock)
- Location (campus)
- Rating (future)
- Merchant verification
- Condition (new/used)

**User Can:**

- Apply multiple filters
- Clear individual filters
- Clear all filters
- See active filter chips
- Save filter combinations (future)
- Share filtered URLs

**Technical Implementation:**

- URL query parameters
- Indexed database queries
- Filter combinations optimization
- Count queries for filter badges
- Cached filter options

---

## 12. Notifications

### 12.1 Notification System (Future)

**Purpose:** Keep users informed of important events

**Planned Features:**

- In-app notifications
- Email notifications
- Push notifications (mobile)
- Notification preferences
- Real-time updates
- Notification history

**Notification Types:**

- Order updates
- Price drops (wishlist)
- Low stock alerts (merchant)
- New messages
- Payment confirmations
- Shipping updates
- Review requests
- System announcements

---

## 🔒 Security Features (Cross-Cutting)

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes
- Session management
- Token refresh mechanism
- Logout from all devices

### Data Security

- HTTPS encryption
- Password hashing (bcrypt, 12 rounds)
- Input sanitization
- XSS prevention
- CSRF protection
- SQL/NoSQL injection prevention
- Rate limiting

### File Security

- File type validation
- File size limits
- Virus scanning (future)
- Secure file storage (S3)
- Access-controlled URLs
- Image optimization

### Payment Security

- PCI DSS compliance (via Stripe)
- Secure payment processing
- No card data storage
- 3D Secure authentication
- Transaction encryption
- Fraud detection

---

## 📱 Responsive Design (Cross-Cutting)

### Device Support

- Desktop (>960px)
- Tablet (600px-960px)
- Mobile (<600px)
- Touch-optimized interactions

### Responsive Features

- Adaptive layouts
- Collapsible navigation
- Bottom sheet modals (mobile)
- Touch gestures
- Optimized images
- Reduced animations (mobile)

---

## ♿ Accessibility Features (Cross-Cutting)

### WCAG 2.1 AA Compliance

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- Alt text for images
- Form labels and hints

---

## 🎯 Performance Optimizations (Cross-Cutting)

### Client-Side

- Code splitting
- Lazy loading
- Image optimization
- Bundle size reduction
- Caching strategies
- Service workers (future)

### Server-Side

- Database indexing
- Query optimization
- Redis caching
- CDN for static assets
- Response compression
- Connection pooling

---

## 🔄 State Management

### Redux Slices

- Auth (user, tokens, roles)
- Cart (items, totals)
- Wishlist (items)
- Orders (purchases, sales)
- Listings (browse, detail)
- Checkout (session, payment)
- Profile (user data, addresses)
- Merchant (shop, analytics)
- UI (theme, notifications)

### Local Storage

- Theme preference
- Draft forms
- Recent searches
- Recently viewed
- Language preference

---

## 📊 Analytics & Tracking

### User Analytics

- Page views
- User journeys
- Feature usage
- Conversion rates
- Drop-off points
- Session duration

### Business Analytics

- Sales metrics
- Revenue tracking
- Product performance
- Customer segments
- Marketing effectiveness
- ROI calculations

---

_Last Updated: November 2025_
_Platform Version: 1.0.0_
_Documentation Maintained by: Development Team_
