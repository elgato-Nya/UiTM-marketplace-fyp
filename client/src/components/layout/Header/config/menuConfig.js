import {
  Home,
  ShoppingBag,
  Store,
  Category,
  Person,
  Settings,
  Help,
  Dashboard,
  Notifications,
  LocalShipping,
  Inventory,
  Assessment,
  People,
  Info,
  History,
  ContactMail,
  Code,
} from "@mui/icons-material";
import { ROUTES } from "../../../../constants/routes";

// Guest menu configuration
export const getGuestMenuItems = () => [
  { icon: <Home />, text: "Home", link: ROUTES.HOME },
  { icon: <Category />, text: "All Listings", link: ROUTES.LISTINGS.ALL },
  { icon: <ShoppingBag />, text: "Products", link: ROUTES.LISTINGS.PRODUCTS },
  { icon: <Store />, text: "Services", link: ROUTES.LISTINGS.SERVICES },
  { icon: <Info />, text: "About Us", link: "/about#about" },
  { icon: <History />, text: "Our History", link: "/about#history" },
  { icon: <Code />, text: "Nekodez", link: "/about/nekodez" },
  { icon: <ContactMail />, text: "Contact", link: "/contact" },
  { icon: <Help />, text: "Help", link: ROUTES.HELP },
];

// Authenticated user menu sections
export const getAuthMenuSections = (roles) => {
  const { isConsumer, isMerchant, isAdmin } = roles;

  return {
    browse: {
      title: "Browse",
      collapsible: true,
      items: [
        { icon: <Home />, text: "Home", link: ROUTES.HOME, show: true },
        {
          icon: <Category />,
          text: "All Listings",
          link: ROUTES.LISTINGS.ALL,
          show: true,
        },
        {
          icon: <ShoppingBag />,
          text: "Products",
          link: ROUTES.LISTINGS.PRODUCTS,
          show: true,
        },
        {
          icon: <Store />,
          text: "Services",
          link: ROUTES.LISTINGS.SERVICES,
          show: true,
        },
      ],
    },

    account: {
      title: "Account",
      collapsible: true,
      items: [
        {
          icon: <LocalShipping />,
          text: "My Orders",
          link: ROUTES.ORDERS.PURCHASES,
          show: isConsumer,
        },
        {
          icon: <Person />,
          text: "Profile",
          link: ROUTES.PROFILE.INDEX,
          show: true,
        },
        {
          icon: <Notifications />,
          text: "Notifications",
          link: ROUTES.NOTIFICATIONS,
          show: true,
        },
      ],
    },

    merchant: {
      title: "Merchant",
      color: "secondary.main",
      collapsible: true,
      show: isMerchant,
      items: [
        {
          icon: <Dashboard />,
          text: "Dashboard",
          link: ROUTES.MERCHANT.DASHBOARD,
          show: isMerchant,
        },
        {
          icon: <Inventory />,
          text: "My Listings",
          link: ROUTES.MERCHANT.LISTINGS.MY_LISTINGS,
          show: isMerchant,
        },
        {
          icon: <LocalShipping />,
          text: "Sales Orders",
          link: ROUTES.MERCHANT.ORDERS,
          show: isMerchant,
        },
        {
          icon: <Assessment />,
          text: "Analytics",
          link: ROUTES.MERCHANT.ANALYTICS,
          show: isMerchant,
        },
      ],
    },

    admin: {
      title: "Admin",
      color: "error.main",
      collapsible: true,
      show: isAdmin,
      items: [
        {
          icon: <Dashboard />,
          text: "Dashboard",
          link: ROUTES.ADMIN.DASHBOARD,
          show: isAdmin,
        },
        {
          icon: <People />,
          text: "Users",
          link: ROUTES.ADMIN.USERS,
          show: isAdmin,
        },
        {
          icon: <Assessment />,
          text: "Reports",
          link: ROUTES.ADMIN.REPORTS,
          show: isAdmin,
        },
        {
          icon: <Settings />,
          text: "Settings",
          link: ROUTES.ADMIN.SETTINGS,
          show: isAdmin,
        },
      ],
    },

    about: {
      title: "About",
      collapsible: true,
      items: [
        { icon: <Info />, text: "About Us", link: "/about#about", show: true },
        {
          icon: <History />,
          text: "Our History",
          link: "/about#history",
          show: true,
        },
        {
          icon: <Code />,
          text: "Nekodez",
          link: "/about/nekodez",
          show: true,
        },
        {
          icon: <ContactMail />,
          text: "Contact Us",
          link: "/contact",
          show: true,
        },
      ],
    },

    settings: {
      title: "Settings & Help",
      collapsible: false,
      items: [
        {
          icon: <Settings />,
          text: "Settings",
          link: ROUTES.SETTINGS,
          show: true,
        },
        {
          icon: <Help />,
          text: "Help & Support",
          link: ROUTES.HELP,
          show: true,
        },
      ],
    },
  };
};
