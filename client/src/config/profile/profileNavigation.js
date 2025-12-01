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

export const getProfileNavigation = (roles = []) => {
  const baseNavigation = [
    {
      id: "profile",
      label: "Profile",
      icon: Person,
      path: "/profile",
      description: "View and edit your personal information",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: ShoppingBag,
      path: "/orders/purchases",
      description: "View and manage your orders history and status",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: LocationOn,
      path: "/profile/addresses",
      description: "Manage your saved addresses",
    },
    {
      id: "security",
      label: "Security",
      icon: Security,
      path: "/profile/security",
      description: "Manage your account security settings",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/profile/settings",
      description: "Add personalization and preferences",
    },
  ];

  if (roles.includes("merchant")) {
    baseNavigation.splice(2, 0, {
      id: "store",
      label: "My Store",
      icon: Store,
      path: "/merchant/store",
      description: "Manage your store profile and settings",
      isMerchant: true,
    });

    baseNavigation.splice(3, 0, {
      id: "analytics",
      label: "Analytics",
      icon: BarChart,
      path: "/merchant/analytics",
      description: "View insights and analytics for your store",
      isMerchant: true,
    });
  }

  return baseNavigation;
};
