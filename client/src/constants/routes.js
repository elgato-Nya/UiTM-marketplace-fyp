/**
 * Application Routes Constants
 * Centralized route definitions to ensure consistency across the app
 */

// ================== PUBLIC ROUTES ========================
export const ROUTES = {
  // Home & Landing
  HOME: "/",
  CONTACT: "/contact",

  // About Section
  ABOUT: {
    INDEX: "/about",
    ABOUT_US: "/about#about",
    HISTORY: "/about#history",
    NEKODEZ: "/about/nekodez",
  },

  // Auth Routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // Listing Routes (Public - View Only)
  LISTINGS: {
    ALL: "/listings",
    PRODUCTS: "/products",
    SERVICES: "/services",
    DETAIL: (id) => `/listings/${id}`,
  },

  // Merchant Routes
  MERCHANTS: {
    DIRECTORY: "/merchants",
    PROFILE: (id) => `/merchants/${id}`,
  },

  // Merchant Dashboard Routes (Authenticated Merchants Only)
  MERCHANT: {
    INDEX: "/merchant",
    DASHBOARD: "/merchant/dashboard",
    STORE: "/merchant/store",
    PRODUCTS: "/merchant/products",
    ORDERS: "/merchant/orders",
    ANALYTICS: "/merchant/analytics",
    BECOME: "/merchant/become",
    VERIFY_EMAIL: "/merchant/verify-email",
    // Listing Management Routes (under merchant)
    LISTINGS: {
      MY_LISTINGS: "/merchant/listings",
      CREATE: "/merchant/listings/create",
      EDIT: (id) => `/merchant/listings/${id}/edit`,
    },
    // Order Management (Seller perspective)
    ORDER_DETAIL: (id) => `/merchant/orders/${id}`,
  },

  // Cart & Wishlist
  CART: "/cart",
  WISHLIST: "/wishlist",

  // Checkout Routes
  CHECKOUT: {
    INDEX: "/checkout",
    SUCCESS: "/checkout/success",
  },

  // Profile Routes
  PROFILE: {
    INDEX: "/profile",
    ADDRESSES: "/profile/addresses",
    SECURITY: "/profile/security",
    SETTINGS: "/profile/settings",
  },

  // Order Routes (Buyer perspective)
  ORDERS: {
    INDEX: "/orders",
    PURCHASES: "/orders/purchases",
    SALES: "/orders/sales",
    DETAIL: (id) => `/orders/${id}`,
  },

  // Admin Dashboard Routes
  ADMIN: {
    INDEX: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    MERCHANT: "/admin/merchants/verification",
    CONTACTS: "/admin/contacts",
    REPORTS: "/admin/reports",
    LISTINGS: "/admin/listings",
    TRANSACTIONS: "/admin/transactions",
    ORDERS: "/admin/orders",
    SUPPORT: "/admin/support",
  },

  // Utility Routes
  SEARCH: "/search",
  BROWSE: "/browse",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",

  // Legal Routes
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // Error Routes
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "/404",
};

// ================== NAVIGATION GROUPS ========================

/**
 * Main Navigation Links (Header)
 */
export const MAIN_NAV = [
  { label: "Home", path: ROUTES.HOME },
  { label: "Products", path: ROUTES.LISTINGS.PRODUCTS },
  { label: "Services", path: ROUTES.LISTINGS.SERVICES },
];

/**
 * User Menu Links (Authenticated Users)
 */
export const USER_MENU = {
  CONSUMER: [
    { icon: "Person", label: "My Profile", path: ROUTES.PROFILE.INDEX },
    {
      icon: "LocationOn",
      label: "My Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
    },
    { icon: "ShoppingBag", label: "My Orders", path: ROUTES.ORDERS.PURCHASES },
    {
      icon: "Notifications",
      label: "Notifications",
      path: ROUTES.NOTIFICATIONS,
    },
    { icon: "Settings", label: "Account Settings", path: ROUTES.SETTINGS },
  ],
  MERCHANT: [
    { icon: "Person", label: "My Profile", path: ROUTES.PROFILE.INDEX },
    {
      icon: "LocationOn",
      label: "My Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
    },
    { icon: "Store", label: "My Store", path: ROUTES.MERCHANT.INDEX },
    {
      icon: "ShoppingBag",
      label: "My Listings",
      path: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
    },
    { icon: "Receipt", label: "Sales Orders", path: ROUTES.MERCHANT.ORDERS },
    {
      icon: "Notifications",
      label: "Notifications",
      path: ROUTES.NOTIFICATIONS,
    },
    { icon: "Settings", label: "Account Settings", path: ROUTES.SETTINGS },
  ],
  ADMIN: [
    { icon: "Person", label: "My Profile", path: ROUTES.PROFILE.INDEX },
    {
      icon: "LocationOn",
      label: "My Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
    },
    { icon: "Dashboard", label: "Admin Dashboard", path: ROUTES.ADMIN.INDEX },
    {
      icon: "Notifications",
      label: "Notifications",
      path: ROUTES.NOTIFICATIONS,
    },
    { icon: "Settings", label: "Account Settings", path: ROUTES.SETTINGS },
  ],
};

/**
 * Mobile Drawer Navigation (Guest)
 */
export const MOBILE_GUEST_NAV = [
  { icon: "Home", label: "Home", path: ROUTES.HOME },
  { icon: "ShoppingBag", label: "Products", path: ROUTES.LISTINGS.PRODUCTS },
  { icon: "Store", label: "Services", path: ROUTES.LISTINGS.SERVICES },
  { icon: "ContactMail", label: "Contact", path: ROUTES.CONTACT },
];

/**
 * Mobile Drawer Navigation (Authenticated)
 */
export const MOBILE_AUTH_NAV = {
  COMMON: [
    { icon: "Home", label: "Home", path: ROUTES.HOME },
    { icon: "ShoppingBag", label: "Products", path: ROUTES.LISTINGS.PRODUCTS },
    { icon: "Store", label: "Services", path: ROUTES.LISTINGS.SERVICES },
    {
      icon: "Notifications",
      label: "Notifications",
      path: ROUTES.NOTIFICATIONS,
    },
    { icon: "Person", label: "Profile", path: ROUTES.PROFILE.INDEX },
    {
      icon: "LocationOn",
      label: "My Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
    },
    { icon: "Settings", label: "Settings", path: ROUTES.SETTINGS },
    { icon: "ContactMail", label: "Contact", path: ROUTES.CONTACT },
  ],
  CONSUMER_ONLY: [
    { icon: "ShoppingBag", label: "My Orders", path: ROUTES.ORDERS.PURCHASES },
  ],
  MERCHANT_ONLY: [
    { icon: "Store", label: "My Store", path: ROUTES.MERCHANT.INDEX },
    {
      icon: "ShoppingBag",
      label: "My Listings",
      path: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
    },
    { icon: "Receipt", label: "Sales Orders", path: ROUTES.MERCHANT.ORDERS },
  ],
  ADMIN_ONLY: [
    { icon: "Dashboard", label: "Admin Panel", path: ROUTES.ADMIN.INDEX },
  ],
};

/**
 * Merchant Dashboard Sidebar
 */
export const MERCHANT_SIDEBAR = [
  { icon: "Dashboard", label: "Dashboard", path: ROUTES.MERCHANT.DASHBOARD },
  { icon: "Store", label: "My Store", path: ROUTES.MERCHANT.STORE },
  {
    icon: "ShoppingBag",
    label: "My Listings",
    path: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
  },
  { icon: "Receipt", label: "Orders", path: ROUTES.MERCHANT.ORDERS },
];

/**
 * Admin Dashboard Sidebar - Grouped Navigation with Collapsible Sections
 * Only showing functional/implemented features
 */
export const ADMIN_SIDEBAR = [
  {
    group: "Overview",
    items: [
      { icon: "Dashboard", label: "Dashboard", path: ROUTES.ADMIN.DASHBOARD },
    ],
  },
  {
    group: "User Management",
    collapsible: true,
    defaultOpen: true,
    items: [
      { icon: "People", label: "Users", path: ROUTES.ADMIN.USERS },
      {
        icon: "VerifiedUser",
        label: "Merchant Verification",
        path: ROUTES.ADMIN.MERCHANT,
      },
    ],
  },
  {
    group: "Communication",
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        icon: "ContactMail",
        label: "Contact Messages",
        path: ROUTES.ADMIN.CONTACTS,
      },
    ],
  },
];

/**
 * Breadcrumb Mappings
 */
export const BREADCRUMB_MAP = {
  [ROUTES.HOME]: "Home",
  [ROUTES.LISTINGS.PRODUCTS]: "Products",
  [ROUTES.LISTINGS.SERVICES]: "Services",
  [ROUTES.MERCHANT.LISTINGS.MY_LISTINGS]: "My Listings",
  [ROUTES.MERCHANT.LISTINGS.CREATE]: "Create Listing",
  [ROUTES.PROFILE.INDEX]: "Profile",
  [ROUTES.PROFILE.ADDRESSES]: "Addresses",
  [ROUTES.PROFILE.SECURITY]: "Security",
  [ROUTES.ORDERS.PURCHASES]: "My Orders",
  [ROUTES.MERCHANT.ORDERS]: "Sales Orders",
  [ROUTES.MERCHANT.INDEX]: "Merchant Dashboard",
  [ROUTES.ADMIN.INDEX]: "Admin Dashboard",
};

export default ROUTES;
