/**
 * Centralized Navigation Configuration
 *
 * SINGLE SOURCE OF TRUTH for all navigation menus across the application.
 * All navigation components should import from this file.
 *
 * @module config/navigation.config
 *
 * USAGE:
 * - Import specific nav configs: import { getMerchantSidebar, getAdminSidebar } from 'config/navigation.config'
 * - All configs use icon NAMES (strings), not JSX components
 * - Components should map icon names to actual icons using ICON_MAP
 */

import { ROUTES } from "../constants/routes";

// ================== ICON NAMES ========================
// Use string names instead of JSX to keep config serializable
// Components should use ICON_MAP to convert names to components

export const ICON_NAMES = {
  // Common
  HOME: "Home",
  DASHBOARD: "Dashboard",
  SETTINGS: "Settings",
  NOTIFICATIONS: "Notifications",
  PERSON: "Person",
  LOGOUT: "Logout",

  // Navigation
  CATEGORY: "Category",
  SHOPPING_BAG: "ShoppingBag",
  STORE: "Store",
  LOCAL_SHIPPING: "LocalShipping",
  INVENTORY: "Inventory",
  RECEIPT: "Receipt",

  // Finance
  ACCOUNT_BALANCE: "AccountBalance",
  REQUEST_QUOTE: "RequestQuote",
  ATTACH_MONEY: "AttachMoney",

  // User Management
  PEOPLE: "People",
  VERIFIED_USER: "VerifiedUser",
  SECURITY: "Security",
  LOCATION: "LocationOn",

  // Analytics & Reports
  BAR_CHART: "BarChart",
  ASSESSMENT: "Assessment",

  // Communication
  CONTACT_MAIL: "ContactMail",
  CHAT: "Chat",

  // About
  INFO: "Info",
  HISTORY: "History",
  CODE: "Code",

  // Misc
  LOCAL_OFFER: "LocalOffer",
};

// ================== NAVIGATION ITEMS ========================

/**
 * Main header navigation (desktop)
 */
export const MAIN_NAV = [
  { label: "Home", path: ROUTES.HOME },
  { label: "Products", path: ROUTES.LISTINGS.PRODUCTS },
  { label: "Services", path: ROUTES.LISTINGS.SERVICES },
];

/**
 * Guest navigation items (mobile drawer)
 */
export const GUEST_NAV = [
  {
    icon: ICON_NAMES.CATEGORY,
    label: "All Listings",
    path: ROUTES.LISTINGS.ALL,
  },
  {
    icon: ICON_NAMES.SHOPPING_BAG,
    label: "Products",
    path: ROUTES.LISTINGS.PRODUCTS,
  },
  { icon: ICON_NAMES.STORE, label: "Services", path: ROUTES.LISTINGS.SERVICES },
  { icon: ICON_NAMES.INFO, label: "About Us", path: ROUTES.ABOUT.ABOUT_US },
  {
    icon: ICON_NAMES.HISTORY,
    label: "Our History",
    path: ROUTES.ABOUT.HISTORY,
  },
  { icon: ICON_NAMES.CODE, label: "Nekodez", path: ROUTES.ABOUT.NEKODEZ },
  { icon: ICON_NAMES.CONTACT_MAIL, label: "Contact", path: ROUTES.CONTACT },
];

/**
 * Browse section (common for all authenticated users)
 */
export const BROWSE_NAV = [
  {
    icon: ICON_NAMES.CATEGORY,
    label: "All Listings",
    path: ROUTES.LISTINGS.ALL,
  },
  {
    icon: ICON_NAMES.SHOPPING_BAG,
    label: "Products",
    path: ROUTES.LISTINGS.PRODUCTS,
  },
  { icon: ICON_NAMES.STORE, label: "Services", path: ROUTES.LISTINGS.SERVICES },
];

/**
 * About section
 */
export const ABOUT_NAV = [
  { icon: ICON_NAMES.INFO, label: "About Us", path: ROUTES.ABOUT.ABOUT_US },
  {
    icon: ICON_NAMES.HISTORY,
    label: "Our History",
    path: ROUTES.ABOUT.HISTORY,
  },
  { icon: ICON_NAMES.CODE, label: "Nekodez", path: ROUTES.ABOUT.NEKODEZ },
  { icon: ICON_NAMES.CONTACT_MAIL, label: "Contact Us", path: ROUTES.CONTACT },
];

// ================== ROLE-BASED NAVIGATION ========================

/**
 * Consumer account navigation
 */
export const CONSUMER_NAV = [
  {
    icon: ICON_NAMES.LOCAL_SHIPPING,
    label: "My Orders",
    path: ROUTES.ORDERS.PURCHASES,
  },
  {
    icon: ICON_NAMES.REQUEST_QUOTE,
    label: "Quote Requests",
    path: ROUTES.QUOTES.INDEX,
  },
  { icon: ICON_NAMES.PERSON, label: "Profile", path: ROUTES.PROFILE.INDEX },
  {
    icon: ICON_NAMES.LOCATION,
    label: "My Addresses",
    path: ROUTES.PROFILE.ADDRESSES,
  },
  {
    icon: ICON_NAMES.NOTIFICATIONS,
    label: "Notifications",
    path: ROUTES.NOTIFICATIONS,
  },
  { icon: ICON_NAMES.SETTINGS, label: "Settings", path: ROUTES.SETTINGS },
];

/**
 * Merchant navigation items (for mobile drawer / account menu)
 */
export const MERCHANT_NAV = [
  {
    icon: ICON_NAMES.DASHBOARD,
    label: "Dashboard",
    path: ROUTES.MERCHANT.DASHBOARD,
  },
  {
    icon: ICON_NAMES.LOCAL_SHIPPING,
    label: "Sales Orders",
    path: ROUTES.MERCHANT.ORDERS,
  },
  {
    icon: ICON_NAMES.REQUEST_QUOTE,
    label: "Quote Requests",
    path: ROUTES.MERCHANT.QUOTES,
  },
  { icon: ICON_NAMES.STORE, label: "My Store", path: ROUTES.MERCHANT.STORE },
  {
    icon: ICON_NAMES.INVENTORY,
    label: "My Listings",
    path: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
  },
  {
    icon: ICON_NAMES.ACCOUNT_BALANCE,
    label: "Payouts",
    path: ROUTES.MERCHANT.PAYOUTS,
  },
];

/**
 * Admin navigation items (for mobile drawer / account menu)
 */
export const ADMIN_NAV = [
  {
    icon: ICON_NAMES.DASHBOARD,
    label: "Dashboard",
    path: ROUTES.ADMIN.DASHBOARD,
  },
  { icon: ICON_NAMES.PEOPLE, label: "Users", path: ROUTES.ADMIN.USERS },
  {
    icon: ICON_NAMES.VERIFIED_USER,
    label: "Merchant Verification",
    path: ROUTES.ADMIN.MERCHANT,
  },
  {
    icon: ICON_NAMES.ACCOUNT_BALANCE,
    label: "Payouts",
    path: ROUTES.ADMIN.PAYOUTS,
  },
  {
    icon: ICON_NAMES.CONTACT_MAIL,
    label: "Contact Messages",
    path: ROUTES.ADMIN.CONTACTS,
  },
];

// ================== DASHBOARD SIDEBARS ========================

/**
 * Merchant Dashboard Sidebar - Grouped Navigation
 */
export const MERCHANT_SIDEBAR = [
  {
    group: "Overview",
    collapsible: false,
    items: [
      {
        icon: ICON_NAMES.DASHBOARD,
        label: "Dashboard",
        path: ROUTES.MERCHANT.DASHBOARD,
      },
    ],
  },
  {
    group: "Orders & Quotes",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        icon: ICON_NAMES.LOCAL_SHIPPING,
        label: "Sales Orders",
        path: ROUTES.MERCHANT.ORDERS,
      },
      {
        icon: ICON_NAMES.REQUEST_QUOTE,
        label: "Quote Requests",
        path: ROUTES.MERCHANT.QUOTES,
      },
    ],
  },
  {
    group: "Store Management",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        icon: ICON_NAMES.STORE,
        label: "My Store",
        path: ROUTES.MERCHANT.STORE,
      },
      {
        icon: ICON_NAMES.INVENTORY,
        label: "My Listings",
        path: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
      },
    ],
  },
  {
    group: "Finance",
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        icon: ICON_NAMES.ACCOUNT_BALANCE,
        label: "Payouts",
        path: ROUTES.MERCHANT.PAYOUTS,
      },
    ],
  },
];

/**
 * Admin Dashboard Sidebar - Grouped Navigation
 */
export const ADMIN_SIDEBAR = [
  {
    group: "Overview",
    collapsible: false,
    items: [
      {
        icon: ICON_NAMES.DASHBOARD,
        label: "Dashboard",
        path: ROUTES.ADMIN.DASHBOARD,
      },
    ],
  },
  {
    group: "User Management",
    collapsible: true,
    defaultOpen: true,
    items: [
      { icon: ICON_NAMES.PEOPLE, label: "Users", path: ROUTES.ADMIN.USERS },
      {
        icon: ICON_NAMES.VERIFIED_USER,
        label: "Merchant Verification",
        path: ROUTES.ADMIN.MERCHANT,
      },
    ],
  },
  {
    group: "Finance",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        icon: ICON_NAMES.ACCOUNT_BALANCE,
        label: "Payouts",
        path: ROUTES.ADMIN.PAYOUTS,
      },
    ],
  },
  {
    group: "Communication",
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        icon: ICON_NAMES.CONTACT_MAIL,
        label: "Contact Messages",
        path: ROUTES.ADMIN.CONTACTS,
      },
    ],
  },
];

// ================== PROFILE NAVIGATION ========================

/**
 * Profile page sidebar navigation
 * @param {string[]} roles - User roles array
 * @returns {Array} Navigation items for profile sidebar
 */
export const getProfileNavigation = (roles = []) => {
  const baseNavigation = [
    {
      id: "profile",
      icon: ICON_NAMES.PERSON,
      label: "Profile",
      path: ROUTES.PROFILE.INDEX,
      description: "View and edit your personal information",
    },
    {
      id: "orders",
      icon: ICON_NAMES.SHOPPING_BAG,
      label: "My Orders",
      path: ROUTES.ORDERS.PURCHASES,
      description: "View and manage your orders history and status",
    },
    {
      id: "quotes",
      icon: ICON_NAMES.REQUEST_QUOTE,
      label: "Quote Requests",
      path: ROUTES.QUOTES.INDEX,
      description: "View and manage your quote requests for services",
    },
    {
      id: "addresses",
      icon: ICON_NAMES.LOCATION,
      label: "Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
      description: "Manage your saved addresses",
    },
    {
      id: "security",
      icon: ICON_NAMES.SECURITY,
      label: "Security",
      path: ROUTES.PROFILE.SECURITY,
      description: "Manage your account security settings",
    },
    {
      id: "settings",
      icon: ICON_NAMES.SETTINGS,
      label: "Settings",
      path: ROUTES.PROFILE.SETTINGS,
      description: "Add personalization and preferences",
    },
  ];

  if (roles.includes("merchant")) {
    // Insert merchant items after quotes
    const merchantItems = [
      {
        id: "store",
        icon: ICON_NAMES.STORE,
        label: "My Store",
        path: ROUTES.MERCHANT.STORE,
        description: "Manage your store profile and settings",
        isMerchant: true,
      },
      {
        id: "merchant-quotes",
        icon: ICON_NAMES.REQUEST_QUOTE,
        label: "Received Quotes",
        path: ROUTES.MERCHANT.QUOTES,
        description: "Manage quote requests from customers",
        isMerchant: true,
      },
      {
        id: "payouts",
        icon: ICON_NAMES.ACCOUNT_BALANCE,
        label: "Payouts",
        path: ROUTES.MERCHANT.PAYOUTS,
        description: "View balance and manage payouts",
        isMerchant: true,
      },
    ];

    // Insert after quotes (index 3)
    baseNavigation.splice(3, 0, ...merchantItems);
  }

  return baseNavigation;
};

// ================== MOBILE DRAWER NAVIGATION ========================

/**
 * Get authenticated user's mobile drawer sections
 * @param {Object} roles - { isConsumer, isMerchant, isAdmin }
 * @returns {Object} Grouped navigation sections
 */
export const getAuthMenuSections = (roles) => {
  const { isConsumer, isMerchant, isAdmin } = roles;

  return {
    browse: {
      title: "Browse",
      collapsible: true,
      items: BROWSE_NAV.map((item) => ({ ...item, show: true })),
    },

    account: {
      title: "Account",
      collapsible: true,
      items: [
        { ...CONSUMER_NAV[0], show: isConsumer }, // My Orders
        { ...CONSUMER_NAV[1], show: isConsumer }, // Quote Requests
        {
          icon: ICON_NAMES.PERSON,
          label: "Profile",
          path: ROUTES.PROFILE.INDEX,
          show: true,
        },
        {
          icon: ICON_NAMES.LOCATION,
          label: "My Addresses",
          path: ROUTES.PROFILE.ADDRESSES,
          show: true,
        },
        {
          icon: ICON_NAMES.NOTIFICATIONS,
          label: "Notifications",
          path: ROUTES.NOTIFICATIONS,
          show: true,
        },
      ],
    },

    merchant: {
      title: "Merchant",
      color: "secondary.main",
      collapsible: true,
      show: isMerchant,
      items: MERCHANT_NAV.map((item) => ({ ...item, show: isMerchant })),
    },

    admin: {
      title: "Admin",
      color: "error.main",
      collapsible: true,
      show: isAdmin,
      items: ADMIN_NAV.map((item) => ({ ...item, show: isAdmin })),
    },

    about: {
      title: "About",
      collapsible: true,
      items: ABOUT_NAV.map((item) => ({ ...item, show: true })),
    },

    settings: {
      title: "Settings",
      collapsible: false,
      show: true,
      items: [
        {
          icon: ICON_NAMES.SETTINGS,
          label: "Settings",
          path: ROUTES.SETTINGS,
          show: true,
        },
      ],
    },
  };
};

// ================== USER MENU (Quick access) ========================

/**
 * User dropdown menu items by role
 */
export const USER_MENU = {
  CONSUMER: [
    {
      icon: ICON_NAMES.PERSON,
      label: "My Profile",
      path: ROUTES.PROFILE.INDEX,
    },
    {
      icon: ICON_NAMES.LOCATION,
      label: "My Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
    },
    {
      icon: ICON_NAMES.SHOPPING_BAG,
      label: "My Orders",
      path: ROUTES.ORDERS.PURCHASES,
    },
    {
      icon: ICON_NAMES.REQUEST_QUOTE,
      label: "Quote Requests",
      path: ROUTES.QUOTES.INDEX,
    },
    {
      icon: ICON_NAMES.NOTIFICATIONS,
      label: "Notifications",
      path: ROUTES.NOTIFICATIONS,
    },
    {
      icon: ICON_NAMES.SETTINGS,
      label: "Account Settings",
      path: ROUTES.SETTINGS,
    },
  ],
  MERCHANT: [
    {
      icon: ICON_NAMES.PERSON,
      label: "My Profile",
      path: ROUTES.PROFILE.INDEX,
    },
    {
      icon: ICON_NAMES.LOCATION,
      label: "My Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
    },
    { icon: ICON_NAMES.STORE, label: "My Store", path: ROUTES.MERCHANT.INDEX },
    {
      icon: ICON_NAMES.INVENTORY,
      label: "My Listings",
      path: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
    },
    {
      icon: ICON_NAMES.RECEIPT,
      label: "Sales Orders",
      path: ROUTES.MERCHANT.ORDERS,
    },
    {
      icon: ICON_NAMES.REQUEST_QUOTE,
      label: "Quote Requests",
      path: ROUTES.MERCHANT.QUOTES,
    },
    {
      icon: ICON_NAMES.ACCOUNT_BALANCE,
      label: "Payouts",
      path: ROUTES.MERCHANT.PAYOUTS,
    },
    {
      icon: ICON_NAMES.NOTIFICATIONS,
      label: "Notifications",
      path: ROUTES.NOTIFICATIONS,
    },
    {
      icon: ICON_NAMES.SETTINGS,
      label: "Account Settings",
      path: ROUTES.SETTINGS,
    },
  ],
  ADMIN: [
    {
      icon: ICON_NAMES.PERSON,
      label: "My Profile",
      path: ROUTES.PROFILE.INDEX,
    },
    {
      icon: ICON_NAMES.LOCATION,
      label: "My Addresses",
      path: ROUTES.PROFILE.ADDRESSES,
    },
    {
      icon: ICON_NAMES.DASHBOARD,
      label: "Admin Dashboard",
      path: ROUTES.ADMIN.INDEX,
    },
    {
      icon: ICON_NAMES.NOTIFICATIONS,
      label: "Notifications",
      path: ROUTES.NOTIFICATIONS,
    },
    {
      icon: ICON_NAMES.SETTINGS,
      label: "Account Settings",
      path: ROUTES.SETTINGS,
    },
  ],
};

// ================== BREADCRUMB MAPPINGS ========================

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
  [ROUTES.QUOTES.INDEX]: "Quote Requests",
  [ROUTES.MERCHANT.ORDERS]: "Sales Orders",
  [ROUTES.MERCHANT.QUOTES]: "Quote Requests",
  [ROUTES.MERCHANT.PAYOUTS]: "Payouts",
  [ROUTES.MERCHANT.INDEX]: "Merchant Dashboard",
  [ROUTES.ADMIN.INDEX]: "Admin Dashboard",
};

// ================== EXPORTS ========================

export default {
  ICON_NAMES,
  MAIN_NAV,
  GUEST_NAV,
  BROWSE_NAV,
  ABOUT_NAV,
  CONSUMER_NAV,
  MERCHANT_NAV,
  ADMIN_NAV,
  MERCHANT_SIDEBAR,
  ADMIN_SIDEBAR,
  USER_MENU,
  BREADCRUMB_MAP,
  getProfileNavigation,
  getAuthMenuSections,
};
