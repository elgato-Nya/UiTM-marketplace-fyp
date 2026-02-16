import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// We'll create these next
import { store } from "./store/index";
import { useTheme } from "./hooks/useTheme";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SocketProvider } from "./contexts/SocketContext";

// Auth Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthGuard from "./components/auth/AuthGuard";
import SessionProvider from "./components/auth/SessionProvider";

// Layout
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import BrowsePage from "./pages/Listing/BrowsePage";
import ListingDetailPage from "./pages/Listing/ListingDetailPage";
import MyListingsPage from "./pages/Listing/MyListingsPage";
import CreateListingPage from "./pages/Listing/CreateListingPage";
import EditListingPage from "./pages/Listing/EditListingPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import AddressesPage from "./pages/Profile/AddressPage";
import PurchasesPage from "./pages/Orders/PurchasePage";
import SalesPage from "./pages/Orders/SalesPage";
import OrderDetailPage from "./pages/Orders/OrderDetailPage";
import CartPage from "./pages/Cart/CartPage";
import WishlistPage from "./pages/Wishlist/WishlistPage";
import CheckoutPageWrapper from "./pages/Checkout/CheckoutPageWrapper";
import CheckoutSuccessPageWrapper from "./pages/Checkout/CheckoutSuccessPageWrapper";
import MerchantAnalyticsPage from "./pages/Merchant/MerchantAnalyticsPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import MerchantVerificationPage from "./pages/Admin/MerchantVerificationPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import ContactManagementPage from "./pages/Admin/ContactManagementPage";
import AdminPayoutPage from "./pages/Admin/AdminPayoutPage";
import PlaceholderPage from "./pages/Admin/PlaceholderPage";
import MyStorePage from "./pages/Merchant/MyStorePage";
import ShopProfilePage from "./pages/Merchant/ShopProfilePage";
import BecomeMerchantPage from "./pages/Merchant/BecomeMerchantPage";
import VerifyMerchantEmailPage from "./pages/Merchant/VerifyMerchantEmailPage";
import AboutPage from "./pages/About/AboutPage";
import NekodezPage from "./pages/About/NekodezPage";
import ContactUsPage from "./pages/Contact/ContactUsPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import ScrollToTop from "./components/common/ScrollToTop";

// Quote Pages
import { MyQuotesPage, SellerQuotesPage } from "./pages/Quote";

// Payout Pages
import PayoutPage from "./pages/Payout/PayoutPage";

// Notification Pages
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import NotificationPreferencesPage from "./pages/Notifications/NotificationPreferencesPage";

// Chat Pages
import ChatPage from "./pages/Chat/ChatPage";

// Legal Pages
import { TermsPage, PrivacyPage, CookiePolicyPage } from "./pages/Legal";

import { ROUTES } from "./constants/routes";

// App content with theme integration
function AppContent() {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <SocketProvider>
        <NotificationProvider>
        <Router>
          <ScrollToTop />
          <SessionProvider>
            <Routes>
              {/* Main Layout Routes */}
              <Route path={ROUTES.HOME} element={<MainLayout />}>
                <Route index element={<HomePage />} />

                {/* Public Listing Routes - Unified Browse Page */}
                <Route path="browse" element={<BrowsePage />} />
                <Route path={ROUTES.LISTINGS.ALL} element={<BrowsePage />} />

                {/* SEO-friendly redirects with type parameter */}
                <Route
                  path={ROUTES.LISTINGS.PRODUCTS}
                  element={
                    <Navigate to={`${ROUTES.BROWSE}?type=product`} replace />
                  }
                />
                <Route
                  path={ROUTES.LISTINGS.SERVICES}
                  element={
                    <Navigate to={`${ROUTES.BROWSE}?type=service`} replace />
                  }
                />

                {/* Cart and Wishlist (Public/Protected) */}
                <Route
                  path={ROUTES.CART}
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.WISHLIST}
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />

                {/* Checkout Routes (Protected) */}
                <Route
                  path={ROUTES.CHECKOUT.INDEX}
                  element={
                    <ProtectedRoute>
                      <CheckoutPageWrapper />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.CHECKOUT.SUCCESS}
                  element={
                    <ProtectedRoute>
                      <CheckoutSuccessPageWrapper />
                    </ProtectedRoute>
                  }
                />

                {/* Merchants Directory */}
                <Route
                  path={ROUTES.MERCHANTS.DIRECTORY}
                  element={<div>Merchants Directory - Coming Soon!</div>}
                />

                {/* Public Shop Profile - Multiple routes for compatibility */}
                <Route path="/shop/:shopSlug" element={<ShopProfilePage />} />
                <Route
                  path="/merchants/:shopSlug"
                  element={<ShopProfilePage />}
                />

                {/* Merchant Application Routes (Public/Protected) */}
                <Route
                  path={ROUTES.MERCHANT.BECOME}
                  element={
                    <ProtectedRoute>
                      <BecomeMerchantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.MERCHANT.VERIFY_EMAIL}
                  element={<VerifyMerchantEmailPage />}
                />

                {/* 
                  Note: Merchant dashboard routes are now consolidated under DashboardLayout
                  See the /merchant routes in the Dashboard Layout Routes section below
                */}

                {/* Protected Profile Routes */}
                <Route
                  path={ROUTES.PROFILE.INDEX}
                  element={
                    <ProtectedRoute>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ProfilePage />} />
                  <Route path="addresses" element={<AddressesPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                {/* Protected Settings Route */}
                <Route
                  path={ROUTES.SETTINGS}
                  element={
                    <ProtectedRoute>
                      <NotificationPreferencesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Notification Preferences Route */}
                <Route
                  path="/notifications/preferences"
                  element={
                    <ProtectedRoute>
                      <NotificationPreferencesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Notifications Route */}
                <Route
                  path={ROUTES.NOTIFICATIONS}
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Chat Routes */}
                <Route
                  path={ROUTES.CHAT.INDEX}
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:conversationId"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />

                {/* Public Listing Detail */}
                <Route
                  path="/listings/:listingId"
                  element={<ListingDetailPage />}
                />

                {/* Protected Order Routes - Buyer Only */}
                <Route
                  path={ROUTES.ORDERS.INDEX}
                  element={
                    <ProtectedRoute>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route path="purchases" element={<PurchasesPage />} />
                  <Route path=":orderId" element={<OrderDetailPage />} />
                </Route>

                {/* Protected Quote Routes - Buyer Only */}
                <Route
                  path={ROUTES.QUOTES.INDEX}
                  element={
                    <ProtectedRoute>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<MyQuotesPage />} />
                  <Route path="my-quotes" element={<MyQuotesPage />} />
                </Route>

                {/* Public Pages */}
                <Route path={ROUTES.ABOUT.INDEX} element={<AboutPage />} />
                <Route path="/about/nekodez" element={<NekodezPage />} />
                <Route path="/contact" element={<ContactUsPage />} />

                {/* Legal Pages */}
                <Route path={ROUTES.TERMS} element={<TermsPage />} />
                <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Auth Layout Routes */}
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
                <Route
                  path="forgot-password"
                  element={
                    <AuthGuard>
                      <ForgotPasswordPage />
                    </AuthGuard>
                  }
                />
              </Route>

              {/* Email Verification & Password Reset Routes (Outside Auth Layout) */}
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Dashboard Layout Routes */}
              {/** Admin Routes */}
              <Route
                path={ROUTES.ADMIN.INDEX}
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <DashboardLayout userRole="admin" />
                  </ProtectedRoute>
                }
              >
                {/* Redirect /admin to /admin/dashboard */}
                <Route
                  index
                  element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />}
                />

                <Route path="dashboard" element={<AdminDashboardPage />} />

                {/* User & Merchant Management */}
                <Route path="users" element={<UserManagementPage />} />
                <Route
                  path="merchants/verification"
                  element={<MerchantVerificationPage />}
                />

                {/* Contact & Report Management */}
                <Route path="contacts" element={<ContactManagementPage />} />

                {/* Payout Management */}
                <Route path="payouts" element={<AdminPayoutPage />} />

                {/* Placeholder routes for features under development */}
                <Route path="reports" element={<PlaceholderPage />} />
                <Route path="listings" element={<PlaceholderPage />} />
                <Route path="transactions" element={<PlaceholderPage />} />
                <Route path="orders" element={<PlaceholderPage />} />
                <Route path="support" element={<PlaceholderPage />} />
                <Route path="settings" element={<PlaceholderPage />} />
              </Route>

              {/** Merchant Routes */}
              <Route
                path={ROUTES.MERCHANT.INDEX}
                element={
                  <ProtectedRoute roles={["merchant"]}>
                    <DashboardLayout userRole="merchant" />
                  </ProtectedRoute>
                }
              >
                {/* Redirect /merchant to /merchant/dashboard */}
                <Route
                  index
                  element={<Navigate to={ROUTES.MERCHANT.DASHBOARD} replace />}
                />

                {/* Dashboard Home - Overview/Summary Page */}
                <Route path="dashboard" element={<MerchantAnalyticsPage />} />

                {/* My Store - Shop Management */}
                <Route path="store" element={<MyStorePage />} />

                {/* Listings Management (nested inside dashboard) */}
                <Route path="listings">
                  <Route index element={<MyListingsPage />} />
                  <Route path="create" element={<CreateListingPage />} />
                  <Route path=":listingId/edit" element={<EditListingPage />} />
                </Route>

                {/* Order Management - Seller View */}
                <Route path="orders">
                  <Route index element={<SalesPage />} />
                  <Route path=":orderId" element={<OrderDetailPage />} />
                </Route>

                {/* Quote Management - Seller View */}
                <Route path="quotes">
                  <Route index element={<SellerQuotesPage />} />
                </Route>

                {/* Payout Management */}
                <Route path="payouts" element={<PayoutPage />} />
              </Route>

              {/* Unauthorized Route */}
              <Route
                path={ROUTES.UNAUTHORIZED}
                element={
                  <div>
                    Unauthorized - You don't have permission to access this page
                  </div>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SessionProvider>
        </Router>
        </NotificationProvider>
        </SocketProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

// Main App component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
