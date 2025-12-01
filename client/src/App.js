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
import CheckoutSuccessPage from "./pages/Checkout/CheckoutSuccessPage";
import MerchantAnalyticsPage from "./pages/Dashboard/MerchantAnalyticsPage";
import MyStorePage from "./pages/Merchant/MyStorePage";
import ShopProfilePage from "./pages/Merchant/ShopProfilePage";
// import NotFoundPage from "./pages/NotFound/NotFoundPage";

import { ROUTES } from "./constants/routes";
// Temporary placeholder components (you'll create these later)
function NotFoundPage() {
  return <div>404 - Page Not Found</div>;
}

function AboutPage() {
  return <div>About Page - Coming Soon!</div>;
}

// App content with theme integration
function AppContent() {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <Router>
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
                  element={<Navigate to="/browse?type=product" replace />}
                />
                <Route
                  path={ROUTES.LISTINGS.SERVICES}
                  element={<Navigate to="/browse?type=service" replace />}
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
                      <CheckoutSuccessPage />
                    </ProtectedRoute>
                  }
                />

                {/* Merchants Directory */}
                <Route
                  path={ROUTES.MERCHANTS.DIRECTORY}
                  element={<div>Merchants Directory - Coming Soon!</div>}
                />

                {/* Public Shop Profile */}
                <Route
                  path="/merchants/:shopSlug"
                  element={<ShopProfilePage />}
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
                </Route>

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

                <Route path={ROUTES.ABOUT} element={<AboutPage />} />
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

                <Route
                  path="dashboard"
                  element={<div>Admin Dashboard Home - Coming Soon!</div>}
                />
                <Route
                  path="users"
                  element={<div>User Management - Coming Soon!</div>}
                />
                <Route
                  path="settings"
                  element={<div>Admin Settings - Coming Soon!</div>}
                />
                <Route
                  path="reports"
                  element={<div>Reports - Coming Soon!</div>}
                />
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

                <Route path="analytics" element={<MerchantAnalyticsPage />} />
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
