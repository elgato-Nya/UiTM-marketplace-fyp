# FYP Chapter 4 - Part 2: System Architecture

## COMPREHENSIVE ARCHITECTURE DOCUMENTATION

**Project**: UiTM Marketplace E-Commerce Platform  
**Document**: System Architecture & Design Patterns  
**Generated**: November 2025

---

## 3. SYSTEM ARCHITECTURE BREAKDOWN

### 3.1 High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 18.3.1 SPA                                         │  │
│  │  - Redux Toolkit State Management                        │  │
│  │  - React Router DOM Routing                              │  │
│  │  - Axios HTTP Client                                     │  │
│  │  - Material-UI + Tailwind CSS                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│  - CORS Validation                                              │
│  - Rate Limiting (1000 req/15min general, 5 req/15min auth)    │
│  - Request Sanitization                                         │
│  - JWT Token Validation                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER TIER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express 5.1.0 Application                               │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │   Routes       │→ │  Controllers   │                 │  │
│  │  └────────────────┘  └────────────────┘                 │  │
│  │          ↓                    ↓                           │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │  Middleware    │  │   Services     │                 │  │
│  │  └────────────────┘  └────────────────┘                 │  │
│  │          ↓                    ↓                           │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │  Validators    │  │     Models     │                 │  │
│  │  └────────────────┘  └────────────────┘                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA & EXTERNAL SERVICES                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   MongoDB    │  │  AWS S3      │  │   Stripe     │         │
│  │   (Mongoose) │  │  (Images)    │  │  (Payments)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │   Winston    │  │  Node Cron   │                            │
│  │   (Logging)  │  │  (Scheduler) │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Frontend Architecture

#### **3.2.1 Folder Structure**

```
client/src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   │   ├── ProtectedRoute.js      # Route guard for authenticated users
│   │   ├── AuthGuard.js           # Redirect if authenticated
│   │   └── SessionProvider.js     # Session management wrapper
│   ├── common/         # Shared components
│   │   ├── BackButton.js
│   │   ├── ErrorBoundary.js
│   │   ├── LoadingSpinner.js
│   │   └── DynamicSkeleton.js
│   ├── layout/         # Layout components
│   │   ├── MainLayout.js          # Main app layout with nav
│   │   ├── AuthLayout.js          # Login/Register layout
│   │   ├── DashboardLayout.js     # Admin/Merchant dashboard
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── Navbar.js
│   │   └── MobileDrawer.js
│   ├── home/           # Home page components
│   │   ├── HeroSection.js
│   │   ├── FeaturedListings.js
│   │   └── CategoryGrid.js
│   └── ui/             # UI primitives (Radix-based)
│       ├── button.jsx
│       ├── card.jsx
│       ├── dialog.jsx
│       ├── input.jsx
│       └── toast.jsx
│
├── pages/              # Page-level components
│   ├── Home/
│   │   └── HomePage.js
│   ├── Auth/
│   │   ├── LoginPage.js
│   │   └── RegisterPage.js
│   ├── Listing/
│   │   ├── BrowsePage.js          # Unified products/services browse
│   │   ├── ListingDetailPage.js
│   │   ├── MyListingsPage.js
│   │   ├── CreateListingPage.js
│   │   └── EditListingPage.js
│   ├── Cart/
│   │   └── CartPage.js
│   ├── Wishlist/
│   │   └── WishlistPage.js
│   ├── Checkout/
│   │   ├── CheckoutPageWrapper.js
│   │   └── CheckoutSuccessPage.js
│   ├── Orders/
│   │   ├── PurchasesPage.js       # Buyer order history
│   │   ├── SalesPage.js           # Seller order history
│   │   └── OrderDetailPage.js
│   ├── Profile/
│   │   ├── ProfilePage.js
│   │   └── AddressPage.js
│   └── Dashboard/
│       └── MerchantAnalyticsPage.js
│
├── features/           # Feature-based modules (Redux slices + services)
│   ├── auth/
│   │   ├── store/
│   │   │   └── authSlice.js       # Redux state: user, tokens, isAuth
│   │   └── service/
│   │       └── authService.js     # API calls: login, register, refresh
│   ├── profile/
│   │   ├── store/
│   │   │   ├── profileSlice.js
│   │   │   └── addressSlice.js
│   │   └── service/
│   │       └── profileService.js
│   ├── listing/
│   │   ├── store/
│   │   │   └── listingSlice.js
│   │   └── service/
│   │       └── listingService.js
│   ├── cart/
│   │   ├── store/
│   │   │   └── cartSlice.js
│   │   └── service/
│   │       └── cartService.js
│   ├── wishlist/
│   │   ├── store/
│   │   │   └── wishlistSlice.js
│   │   └── service/
│   │       └── wishlistService.js
│   ├── checkout/
│   │   ├── store/
│   │   │   └── checkoutSlice.js
│   │   └── service/
│   │       └── checkoutService.js
│   ├── orders/
│   │   ├── store/
│   │   │   └── orderSlice.js
│   │   └── service/
│   │       └── orderService.js
│   └── analytic/
│       ├── store/
│       │   └── analyticsSlice.js
│       └── service/
│           └── analyticsService.js
│
├── hooks/              # Custom React hooks
│   ├── useTheme.js            # Theme switching
│   ├── useSnackbar.js         # Toast notifications
│   ├── useToast.js            # Alternative toast
│   └── useImageUpload.js      # Image upload handling
│
├── contexts/           # React Context providers
│   └── SnackbarContext.js     # Global snackbar state
│
├── store/              # Redux store configuration
│   ├── index.js               # Store setup with all reducers
│   └── slice/
│       ├── themeSlice.js
│       └── uploadSlice.js
│
├── services/           # API service layer
│   ├── api/
│   │   └── apiClient.js       # Axios instance with interceptors
│   ├── auth/
│   │   └── authService.js
│   └── uploadService.js
│
├── validation/         # Frontend validation schemas
│   └── authValidator.js       # Yup schemas for forms
│
├── config/             # Configuration files
│   └── forms/
│       └── authForms.js       # Form field configurations
│
├── constants/          # Constant values
│   ├── routes.js              # Route path constants
│   └── authConstant.js        # Auth-related constants
│
├── utils/              # Utility functions
│   ├── formatters.js          # Date, currency formatting
│   └── validators.js          # Validation helpers
│
├── styles/             # Global styles
│   └── index.css              # Tailwind imports + custom CSS
│
├── App.js              # Root component with routing
└── index.js            # React entry point
```

#### **3.2.2 Component Architecture Patterns**

**1. Container/Presentational Pattern**

```javascript
// Container Component (Smart - connects to Redux)
// pages/Listing/BrowsePage.js
const BrowsePage = () => {
  const dispatch = useDispatch();
  const { listings, loading } = useSelector((state) => state.listing);

  useEffect(() => {
    dispatch(fetchListings());
  }, []);

  return <ListingGrid listings={listings} loading={loading} />;
};

// Presentational Component (Dumb - receives props)
// components/listing/ListingGrid.js
const ListingGrid = ({ listings, loading }) => {
  if (loading) return <Skeleton />;
  return (
    <div className="grid grid-cols-3 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing._id} {...listing} />
      ))}
    </div>
  );
};
```

**2. Custom Hooks for Logic Reuse**

```javascript
// hooks/useImageUpload.js
const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  const uploadImages = async (files) => {
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const response = await uploadService.uploadImages(formData);
    setImages((prev) => [...prev, ...response.data.urls]);
    setUploading(false);
  };

  return { images, uploading, uploadImages };
};
```

**3. Protected Route Pattern**

```javascript
// components/auth/ProtectedRoute.js
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  if (roles.length > 0 && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Usage in App.js
<Route
  path="/merchant/dashboard"
  element={
    <ProtectedRoute roles={["merchant"]}>
      <MerchantDashboard />
    </ProtectedRoute>
  }
/>;
```

#### **3.2.3 State Management Architecture**

**Redux Store Structure**:

```javascript
// store/index.js
{
  theme: {
    mode: 'light',
    palette: {...}
  },
  auth: {
    user: {...},
    isAuthenticated: false,
    accessToken: null,
    loading: false,
    error: null
  },
  profile: {
    data: {...},
    loading: false,
    error: null
  },
  addresses: {
    list: [],
    selected: null,
    loading: false
  },
  listing: {
    listings: [],
    currentListing: null,
    filters: {...},
    pagination: {...},
    loading: false
  },
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false
  },
  wishlist: {
    items: [],
    totalItems: 0,
    loading: false
  },
  checkout: {
    session: null,
    paymentIntent: null,
    status: 'idle',
    loading: false
  },
  orders: {
    purchases: [],
    sales: [],
    currentOrder: null,
    loading: false
  },
  analytics: {
    merchantData: {...},
    platformData: {...},
    loading: false
  },
  upload: {
    uploading: false,
    progress: 0,
    urls: []
  }
}
```

**Redux Thunk Actions Example**:

```javascript
// features/cart/store/cartSlice.js
export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ listingId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.addItem(listingId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalItems: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});
```

#### **3.2.4 Routing Architecture**

**Route Structure**:

```javascript
// App.js routing configuration
<Routes>
  {/* Main Layout - Public Pages */}
  <Route path="/" element={<MainLayout />}>
    <Route index element={<HomePage />} />
    <Route path="browse" element={<BrowsePage />} />
    <Route path="listings/:listingId" element={<ListingDetailPage />} />

    {/* Protected Routes */}
    <Route
      path="cart"
      element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="wishlist"
      element={
        <ProtectedRoute>
          <WishlistPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="checkout"
      element={
        <ProtectedRoute>
          <CheckoutPageWrapper />
        </ProtectedRoute>
      }
    />

    {/* Nested Profile Routes */}
    <Route
      path="profile"
      element={
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      }
    >
      <Route index element={<ProfilePage />} />
      <Route path="addresses" element={<AddressesPage />} />
    </Route>

    {/* Orders */}
    <Route path="orders">
      <Route
        path="purchases"
        element={
          <ProtectedRoute>
            <PurchasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="sales"
        element={
          <ProtectedRoute>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path=":orderId"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
    </Route>
  </Route>

  {/* Auth Layout */}
  <Route path="/auth" element={<AuthLayout />}>
    <Route
      path="login"
      element={
        <AuthGuard>
          <LoginPage />
        </AuthGuard>
      }
    />
    <Route
      path="register"
      element={
        <AuthGuard>
          <RegisterPage />
        </AuthGuard>
      }
    />
  </Route>

  {/* Dashboard Layouts (Admin/Merchant) */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<UserManagement />} />
  </Route>

  <Route
    path="/merchant"
    element={
      <ProtectedRoute roles={["merchant"]}>
        <DashboardLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" />} />
    <Route path="dashboard" element={<MerchantAnalyticsPage />} />
    <Route path="listings">
      <Route index element={<MyListingsPage />} />
      <Route path="create" element={<CreateListingPage />} />
      <Route path=":listingId/edit" element={<EditListingPage />} />
    </Route>
    <Route path="analytics" element={<MerchantAnalyticsPage />} />
  </Route>
</Routes>
```

### 3.3 Backend Architecture

#### **3.3.1 Folder Structure**

```
server/
├── config/                  # Configuration modules
│   ├── database.config.js   # MongoDB connection setup
│   ├── cors.config.js       # CORS configuration
│   ├── helmet.config.js     # Security headers
│   ├── limiter.config.js    # Rate limiting rules
│   └── stripe.config.js     # Stripe initialization
│
├── controllers/             # Request handlers (thin layer)
│   ├── base.controller.js   # Base controller with common methods
│   ├── user/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── address.controller.js
│   │   └── merchant.controller.js
│   ├── listing/
│   │   └── listing.controller.js
│   ├── cart/
│   │   └── cart.controller.js
│   ├── wishlist/
│   │   └── wishlist.controller.js
│   ├── checkout/
│   │   └── checkout.controller.js
│   ├── order/
│   │   └── order.controller.js
│   ├── upload/
│   │   └── upload.controller.js
│   └── analytic/
│       └── analytics.controller.js
│
├── services/                # Business logic layer
│   ├── base.service.js      # Base service with error handling
│   ├── jwt.service.js       # JWT generation/verification
│   ├── token.service.js     # Token management
│   ├── cors.service.js      # CORS origin validation
│   ├── email.service.js     # Email sending (planned)
│   ├── user/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── address.service.js
│   │   └── merchant.service.js
│   ├── listing/
│   │   └── listing.service.js
│   ├── cart/
│   │   └── cart.service.js
│   ├── wishlist/
│   │   └── wishlist.service.js
│   ├── checkout/
│   │   ├── index.js
│   │   ├── checkoutSession.service.js
│   │   ├── paymentIntent.service.js
│   │   ├── orderCreation.service.js
│   │   └── validation.service.js
│   ├── order/
│   │   └── order.service.js
│   ├── stripe/
│   │   └── payment.service.js
│   ├── upload/
│   │   └── upload.service.js
│   └── analytic/
│       ├── merchantAnalytics.service.js
│       └── platformAnalytics.service.js
│
├── models/                  # Mongoose schemas
│   ├── index.js            # Export all models
│   ├── user/
│   │   ├── user.model.js
│   │   ├── address.schema.js
│   │   └── merchant.schema.js
│   ├── listing/
│   │   └── listing.model.js
│   ├── cart/
│   │   ├── cart.model.js
│   │   └── cartItem.schema.js
│   ├── wishlist/
│   │   └── wishlist.model.js
│   ├── checkout/
│   │   ├── checkoutSession.model.js
│   │   ├── checkoutItem.schema.js
│   │   ├── sellerGroup.schema.js
│   │   ├── pricingSummary.schema.js
│   │   └── stockReservation.schema.js
│   ├── order/
│   │   ├── order.model.js
│   │   ├── orderItem.schema.js
│   │   ├── buyerInfo.schema.js
│   │   ├── sellerInfo.schema.js
│   │   └── deliveryAddress.schema.js
│   └── analytic/
│       ├── merchantAnalytics.model.js
│       └── platformAnalytics.model.js
│
├── routes/                  # API route definitions
│   ├── user/
│   │   ├── auth.route.js
│   │   ├── user.route.js
│   │   ├── address.route.js
│   │   └── merchant.route.js
│   ├── listing/
│   │   └── listing.route.js
│   ├── cart/
│   │   └── cart.route.js
│   ├── wishlist/
│   │   └── wishlist.route.js
│   ├── checkout/
│   │   └── checkout.route.js
│   ├── order/
│   │   └── order.route.js
│   ├── upload/
│   │   └── upload.route.js
│   └── analytic/
│       └── analytics.route.js
│
├── middleware/              # Express middleware
│   ├── auth/
│   │   └── auth.middleware.js      # JWT verification, RBAC
│   ├── validations/
│   │   ├── user/
│   │   │   └── auth.validation.js
│   │   ├── listing/
│   │   │   └── listing.validation.js
│   │   └── ...
│   └── errorHandler.js     # Global error handler
│
├── validators/              # Validation logic
│   ├── user/
│   │   └── user.validator.js
│   ├── listing/
│   │   └── listing.validator.js
│   ├── cart/
│   │   └── cart.validator.js
│   ├── wishlist/
│   │   └── wishlist.validator.js
│   ├── order/
│   │   └── order.validator.js
│   └── checkout/
│       └── checkout.validator.js
│
├── utils/                   # Utility functions
│   ├── logger.js           # Winston logger setup
│   ├── asyncHandler.js     # Async error wrapper
│   ├── sanitizer.js        # Input sanitization
│   ├── errors/             # Custom error classes
│   │   ├── index.js
│   │   ├── AppError.js
│   │   └── errorFactory.js
│   └── enums/              # Constant enumerations
│       ├── user.enum.js
│       ├── listing.enum.js
│       ├── order.enum.js
│       └── cart.enum.js
│
├── jobs/                    # Background jobs
│   └── analytics.job.js    # Daily analytics calculation
│
├── scripts/                 # Utility scripts
│   ├── db-seed.js          # Database seeding
│   ├── generate-jwt.js     # JWT secret generation
│   ├── health-check.js     # Server health monitoring
│   ├── view-logs.js        # Log viewer
│   └── cleanup-logs.js     # Old log cleanup
│
├── tests/                   # Test suites
│   ├── unit/
│   │   ├── user.unit.test.js
│   │   ├── listing.unit.test.js
│   │   ├── address.unit.test.js
│   │   └── validators/
│   │       └── order.validator.test.js
│   ├── integration/
│   │   ├── user.integration.test.js
│   │   ├── address.integration.test.js
│   │   └── server.startup.test.js
│   └── utils/
│       └── testHelpers.js
│
├── logs/                    # Log files (gitignored)
│   ├── error/
│   ├── application/
│   └── http/
│
├── migrations/              # Database migrations
│   └── rename-listingId-to-listing.js
│
├── .env                     # Environment variables (gitignored)
├── .env.example            # Example env file
├── index.js                # Application entry point
├── jest.config.js          # Jest configuration
├── jest.env.js             # Jest environment setup
└── package.json            # Dependencies and scripts
```

#### **3.3.2 Layered Architecture Pattern**

**Request Flow**:

```
Client Request
    ↓
Route Handler (routes/*.route.js)
    ↓
Validation Middleware (middleware/validations/*.validation.js)
    ↓
Authentication Middleware (middleware/auth/auth.middleware.js)
    ↓
Authorization Middleware (authorize(...roles))
    ↓
Controller (controllers/*.controller.js)
    ↓
Service Layer (services/*.service.js)
    ↓
Model/Database (models/*.model.js → MongoDB)
    ↓
Service Response
    ↓
Controller Response Formatting
    ↓
Client Response (JSON)
```

**Example Implementation**:

```javascript
// 1. Route Definition (routes/listing/listing.route.js)
const express = require("express");
const router = express.Router();
const {
  protect,
  authorize,
  isListingOwner,
} = require("../../middleware/auth/auth.middleware");
const {
  validateCreateListing,
} = require("../../middleware/validations/listing/listing.validation");
const {
  handleCreateListing,
  handleUpdateListing,
} = require("../../controllers/listing/listing.controller");

router.post(
  "/",
  protect, // JWT authentication
  authorize("merchant"), // Role check
  validateCreateListing, // Input validation
  handleCreateListing // Controller
);

router.put(
  "/:id",
  protect,
  isListingOwner("id"), // Ownership check
  handleUpdateListing
);

// 2. Controller (controllers/listing/listing.controller.js)
const asyncHandler = require("../../utils/asyncHandler");
const {
  createListing,
  updateListing,
} = require("../../services/listing/listing.service");
const { sanitizeObject } = require("../../utils/sanitizer");

const handleCreateListing = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const listingData = sanitizeObject(req.body);

  const listing = await createListing(userId, listingData);

  return res.status(201).json({
    success: true,
    message: "Listing created successfully",
    data: { listing },
  });
}, "handle_create_listing");

// 3. Service (services/listing/listing.service.js)
const Listing = require("../../models/listing/listing.model");
const {
  createNotFoundError,
  createBadRequestError,
} = require("../../utils/errors");
const logger = require("../../utils/logger");

const createListing = async (userId, listingData) => {
  try {
    // Validate seller is a merchant
    const user = await User.findById(userId);
    if (!user.roles.includes("merchant")) {
      throw createBadRequestError(
        "Only merchants can create listings",
        "NOT_MERCHANT"
      );
    }

    // Create listing
    const listing = new Listing({
      ...listingData,
      seller: { userId },
    });

    await listing.save();

    logger.info("Listing created", {
      listingId: listing._id,
      userId: userId,
      type: listing.type,
      category: listing.category,
    });

    return listing;
  } catch (error) {
    logger.error("Failed to create listing", {
      error: error.message,
      userId: userId,
    });
    throw error;
  }
};

// 4. Model (models/listing/listing.model.js)
const ListingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: [isValidListingName, "Invalid listing name"],
  },
  // ... other fields
});

// Pre-save middleware to populate seller info
ListingSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("seller.userId")) {
    const user = await User.findById(this.seller.userId);
    this.seller.username = user.profile.username;
    this.seller.shopName = user.merchantDetails?.shopName;
  }
  next();
});
```

### 3.4 Authentication & Authorization Architecture

#### **3.4.1 JWT Token Design**

**Access Token Structure**:

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "student@student.uitm.edu.my",
    "roles": ["consumer", "merchant"],
    "iat": 1699123456,
    "exp": 1699124356,
    "iss": "ecommerce-app",
    "aud": "ecommerce-users"
  },
  "signature": "..."
}
```

- **Expiry**: 15 minutes
- **Storage**: Memory/Redux state (NOT localStorage for security)
- **Transport**: Authorization header (`Bearer <token>`)

**Refresh Token Structure**:

```json
{
  "payload": {
    "userId": "507f1f77bcf86cd799439011",
    "tokenType": "refresh",
    "iat": 1699123456,
    "exp": 1699728256,
    "iss": "ecommerce-app",
    "aud": "ecommerce-users"
  }
}
```

- **Expiry**: 7 days
- **Storage**: HTTP-only cookie (secure in production)
- **Max Count**: 5 per user (oldest auto-removed)
- **Database Storage**: Stored in user document for validation

#### **3.4.2 Authentication Flow**

**Login Flow**:

```
1. User submits credentials (email, password)
   ↓
2. Server validates email format (UiTM domain)
   ↓
3. Find user by email
   ↓
4. Compare password with bcrypt (with timing attack mitigation)
   ↓
5. Generate access token (15min) + refresh token (7 days)
   ↓
6. Save refresh token to user document (max 5)
   ↓
7. Set refresh token in HTTP-only cookie
   ↓
8. Return access token + user data in response
   ↓
9. Client stores access token in Redux state
```

**Token Refresh Flow**:

```
1. Access token expires (15 minutes)
   ↓
2. API request fails with 401 Unauthorized
   ↓
3. Axios interceptor catches error
   ↓
4. Extract refresh token from HTTP-only cookie
   ↓
5. Call /api/auth/refresh endpoint
   ↓
6. Server validates refresh token
   ↓
7. Check if token exists in user's refreshTokens array
   ↓
8. Generate new access token + new refresh token
   ↓
9. Update refreshTokens array (token rotation)
   ↓
10. Return new tokens
    ↓
11. Retry original failed request with new access token
```

**Implementation**:

```javascript
// Client-side: Axios interceptor (services/api/apiClient.js)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token is sent automatically via HTTP-only cookie
        const response = await axios.post("/api/auth/refresh");
        const { accessToken } = response.data.data;

        // Update Redux state with new token
        store.dispatch(setAccessToken(accessToken));

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Server-side: Refresh endpoint (controllers/user/auth.controller.js)
const handleRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw createAuthError("No refresh token provided");
  }

  // Verify token
  const decoded = verifyRefreshToken(refreshToken);

  // Find user and check if token exists in their array
  const user = await User.findById(decoded.userId).select("+refreshTokens");

  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw createAuthError("Invalid refresh token");
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = await getTokenPair(
    user
  );

  // Remove old refresh token and add new one (token rotation)
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  // Set new refresh token in cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.json({
    success: true,
    data: { accessToken },
  });
});
```

#### **3.4.3 Role-Based Access Control (RBAC)**

**Middleware Implementation**:

```javascript
// middleware/auth/auth.middleware.js

// Authentication Middleware
const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract token from header
  const token = getTokenFromHeader(req);
  if (!token) {
    throw createAuthError("No token provided");
  }

  // 2. Verify token
  const decoded = verifyAccessToken(token);

  // 3. Find user
  const user = await User.findById(decoded.userId).select(
    "-password -refreshTokens"
  );
  if (!user) {
    throw createNotFoundError("User");
  }

  // 4. Attach user to request
  req.user = user;

  // 5. Update last active (async, non-blocking)
  setImmediate(() => {
    User.findByIdAndUpdate(user._id, { lastActive: new Date() }).catch(
      (err) => {
        logger.error("Failed to update last active", {
          userId: user._id,
          error: err.message,
        });
      }
    );
  });

  next();
});

// Authorization Middleware (Higher-order function)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      throw createForbiddenError("No user roles found");
    }

    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      logger.warn("Insufficient permissions", {
        userId: req.user._id,
        userRoles: userRoles,
        requiredRoles: allowedRoles,
        route: req.originalUrl,
      });
      throw createForbiddenError("Insufficient permissions");
    }

    next();
  };
};

// Ownership-based Authorization
const isListingOwner = (paramName = "id") => {
  return asyncHandler(async (req, res, next) => {
    const listingId = req.params[paramName];
    const userId = req.user._id;

    // Admins bypass ownership checks
    if (req.user.roles.includes("admin")) {
      return next();
    }

    const listing = await Listing.findById(listingId).select("seller.userId");

    if (!listing) {
      throw createNotFoundError("Listing");
    }

    if (listing.seller.userId.toString() !== userId.toString()) {
      logger.security("Unauthorized listing access attempt", {
        listingId,
        ownerId: listing.seller.userId,
        attemptedBy: userId,
      });
      throw createForbiddenError("You can only access your own listings");
    }

    req.listing = listing; // Attach for controller use
    next();
  });
};
```

**Usage Examples**:

```javascript
// Public route
router.get("/listings", handleGetListings);

// Authenticated route
router.get("/profile", protect, handleGetProfile);

// Role-specific route
router.post("/listings", protect, authorize("merchant"), handleCreateListing);

// Ownership-based route
router.put("/listings/:id", protect, isListingOwner("id"), handleUpdateListing);

// Multiple roles
router.get(
  "/analytics",
  protect,
  authorize("merchant", "admin"),
  handleGetAnalytics
);

// Admin-only with level check
router.get(
  "/platform-analytics",
  protect,
  authorize("admin"),
  handleGetPlatformAnalytics
);
```

### 3.5 API Structure & Design

#### **3.5.1 RESTful Endpoint Design**

**Standard CRUD Patterns**:

```
Resource: Listings

GET    /api/listings              # List all listings (with filters)
GET    /api/listings/:id          # Get single listing
POST   /api/listings              # Create listing (merchant only)
PUT    /api/listings/:id          # Update listing (owner only)
DELETE /api/listings/:id          # Delete listing (owner only)
PATCH  /api/listings/:id/toggle   # Toggle availability (owner only)

Query Parameters:
?type=product                     # Filter by type
?category=Electronics             # Filter by category
?minPrice=10&maxPrice=100        # Price range
?campus=Shah Alam                # Filter by campus
?search=textbook                 # Search query
?sort=createdAt:desc             # Sort order
?page=1&limit=20                 # Pagination
```

**Nested Resource Patterns**:

```
# Merchant-specific listings
GET /api/merchants/:merchantId/listings

# User addresses
GET    /api/users/me/addresses
POST   /api/users/me/addresses
PUT    /api/users/me/addresses/:id
DELETE /api/users/me/addresses/:id
PATCH  /api/users/me/addresses/:id/default

# Orders
GET /api/orders/purchases        # Buyer orders
GET /api/orders/sales            # Seller orders
GET /api/orders/:id              # Single order (participant only)
PATCH /api/orders/:id/status     # Update order status (seller/admin)
POST /api/orders/:id/cancel      # Cancel order (buyer)
```

#### **3.5.2 Response Standardization**

**Success Response Format**:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Resource data
  },
  "meta": {
    "timestamp": "2025-11-15T10:30:00.000Z",
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Response Format**:

```json
{
  "success": false,
  "message": "Error description for user",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "stack": "Error stack trace" // Development only
}
```

**Pagination Response**:

```json
{
  "success": true,
  "data": {
    "listings": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 150,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

**END OF PART 2**

This document provides detailed architecture breakdown. Continue to Part 3 for complete database design documentation.
