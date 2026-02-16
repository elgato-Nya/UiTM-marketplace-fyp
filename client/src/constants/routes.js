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
    QUOTES: "/merchant/quotes",
    PAYOUTS: "/merchant/payouts",
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
    QUOTE_DETAIL: (id) => `/merchant/quotes/${id}`,
  },

  // Quote Routes (Buyer perspective)
  QUOTES: {
    INDEX: "/quotes",
    MY_QUOTES: "/quotes/my-quotes",
    DETAIL: (id) => `/quotes/${id}`,
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
    PAYOUTS: "/admin/payouts",
    CONTACTS: "/admin/contacts",
    REPORTS: "/admin/reports",
    LISTINGS: "/admin/listings",
    TRANSACTIONS: "/admin/transactions",
    ORDERS: "/admin/orders",
    SUPPORT: "/admin/support",
  },

  // Chat Routes
  CHAT: {
    INDEX: "/chat",
    DETAIL: (id) => `/chat/${id}`,
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
// REMOVED: Re-exports from navigation.config.js (caused circular dependency)
// Import navigation configs directly from: config/navigation.config.js

// Legacy exports for backward compatibility (deprecated - use navigation.config.js)
export const MOBILE_GUEST_NAV = [
  { icon: "Home", label: "Home", path: ROUTES.HOME },
  { icon: "ShoppingBag", label: "Products", path: ROUTES.LISTINGS.PRODUCTS },
  { icon: "Store", label: "Services", path: ROUTES.LISTINGS.SERVICES },
  { icon: "ContactMail", label: "Contact", path: ROUTES.CONTACT },
];

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
    { icon: "Chat", label: "Messages", path: ROUTES.CHAT.INDEX },
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
    {
      icon: "RequestQuote",
      label: "Quote Requests",
      path: ROUTES.QUOTES.INDEX,
    },
  ],
  MERCHANT_ONLY: [
    { icon: "Store", label: "My Store", path: ROUTES.MERCHANT.INDEX },
    {
      icon: "ShoppingBag",
      label: "My Listings",
      path: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
    },
    { icon: "Receipt", label: "Sales Orders", path: ROUTES.MERCHANT.ORDERS },
    {
      icon: "RequestQuote",
      label: "Quote Requests",
      path: ROUTES.MERCHANT.QUOTES,
    },
    { icon: "AccountBalance", label: "Payouts", path: ROUTES.MERCHANT.PAYOUTS },
  ],
  ADMIN_ONLY: [
    { icon: "Dashboard", label: "Admin Panel", path: ROUTES.ADMIN.INDEX },
  ],
};

export default ROUTES;
