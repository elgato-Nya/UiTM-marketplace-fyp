import {
  Home,
  ShoppingBag,
  Store,
  Category,
  Person,
  Settings,
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
  LocationOn,
  RequestQuote,
  AccountBalance,
  BarChart,
  VerifiedUser,
} from "@mui/icons-material";
import {
  ICON_NAMES,
  GUEST_NAV,
  getAuthMenuSections as getCentralizedAuthMenuSections,
} from "../../../../config/navigation.config";

// Icon mapping for centralized config
const ICON_MAP = {
  [ICON_NAMES.CATEGORY]: <Category />,
  [ICON_NAMES.SHOPPING_BAG]: <ShoppingBag />,
  [ICON_NAMES.STORE]: <Store />,
  [ICON_NAMES.INFO]: <Info />,
  [ICON_NAMES.HISTORY]: <History />,
  [ICON_NAMES.CODE]: <Code />,
  [ICON_NAMES.CONTACT_MAIL]: <ContactMail />,
  [ICON_NAMES.PERSON]: <Person />,
  [ICON_NAMES.LOCATION]: <LocationOn />,
  [ICON_NAMES.NOTIFICATIONS]: <Notifications />,
  [ICON_NAMES.SETTINGS]: <Settings />,
  [ICON_NAMES.LOCAL_SHIPPING]: <LocalShipping />,
  [ICON_NAMES.REQUEST_QUOTE]: <RequestQuote />,
  [ICON_NAMES.DASHBOARD]: <Dashboard />,
  [ICON_NAMES.INVENTORY]: <Inventory />,
  [ICON_NAMES.ACCOUNT_BALANCE]: <AccountBalance />,
  [ICON_NAMES.BAR_CHART]: <BarChart />,
  [ICON_NAMES.PEOPLE]: <People />,
  [ICON_NAMES.VERIFIED_USER]: <VerifiedUser />,
};

// Convert centralized config items to menuConfig format with JSX icons
const convertToMenuFormat = (items) => {
  return items.map((item) => ({
    icon: ICON_MAP[item.icon] || <Category />,
    text: item.label,
    link: item.path,
    show: item.show !== undefined ? item.show : true,
  }));
};

// Guest menu configuration
export const getGuestMenuItems = () => convertToMenuFormat(GUEST_NAV);

// Authenticated user menu sections
export const getAuthMenuSections = (roles) => {
  const centralizedSections = getCentralizedAuthMenuSections(roles);

  // Convert each section's items to menu format
  return {
    browse: {
      ...centralizedSections.browse,
      items: convertToMenuFormat(centralizedSections.browse.items),
    },
    account: {
      ...centralizedSections.account,
      items: convertToMenuFormat(centralizedSections.account.items),
    },
    merchant: {
      ...centralizedSections.merchant,
      items: convertToMenuFormat(centralizedSections.merchant.items),
    },
    admin: {
      ...centralizedSections.admin,
      items: convertToMenuFormat(centralizedSections.admin.items),
    },
    about: {
      ...centralizedSections.about,
      items: convertToMenuFormat(centralizedSections.about.items),
    },
    settings: {
      ...centralizedSections.settings,
      items: convertToMenuFormat(centralizedSections.settings.items),
    },
  };
};
