import {
  Person,
  ShoppingBag,
  LocationOn,
  Security,
  Settings,
  Store,
  BarChart,
  Notifications,
} from "@mui/icons-material";
import { ROUTES } from "../../constants/routes";

export const getProfileNavigation = (roles = []) => {
  const baseNavigation = [
    {
      id: "profile",
      label: "Profile",
      icon: Person,
      path: ROUTES.PROFILE.INDEX,
      description: "View and edit your personal information",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: ShoppingBag,
      path: ROUTES.ORDERS.PURCHASES,
      description: "View and manage your orders history and status",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: LocationOn,
      path: ROUTES.PROFILE.ADDRESSES,
      description: "Manage your saved addresses",
    },
    {
      id: "security",
      label: "Security",
      icon: Security,
      path: ROUTES.PROFILE.SECURITY,
      description: "Manage your account security settings",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: ROUTES.PROFILE.SETTINGS,
      description: "Add personalization and preferences",
    },
  ];

  if (roles.includes("merchant")) {
    baseNavigation.splice(2, 0, {
      id: "store",
      label: "My Store",
      icon: Store,
      path: ROUTES.MERCHANT.STORE,
      description: "Manage your store profile and settings",
      isMerchant: true,
    });

    baseNavigation.splice(3, 0, {
      id: "analytics",
      label: "Analytics",
      icon: BarChart,
      path: ROUTES.MERCHANT.ANALYTICS,
      description: "View insights and analytics for your store",
      isMerchant: true,
    });
  }

  return baseNavigation;
};
