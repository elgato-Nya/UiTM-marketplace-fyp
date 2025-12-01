import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { ROUTES } from "../../constants/routes";

/**
 * ProtectedRoute - Protects routes based on authentication and roles
 *
 * @param {Object} props
 * @param {React.Component} props.children - The component to render if authorized
 * @param {Array<string>} props.roles - Required roles (optional)
 * @param {boolean} props.requireEmailVerification - Require email verification (optional)
 * @param {React.Component} props.fallback - Custom fallback component (optional)
 */
function ProtectedRoute({
  children,
  roles = [],
  requireEmailVerification = false,
  fallback = null,
}) {
  const { isAuthenticated, user, isLoading, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
    );
  }

  // Check email verification if required
  if (requireEmailVerification && !user?.emailVerified) {
    return (
      <Navigate
        to={ROUTES.AUTH.VERIFY_EMAIL}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role permissions if roles are specified
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return (
      fallback || (
        <Navigate to={ROUTES.UNAUTHORIZED} state={{ from: location }} replace />
      )
    );
  }

  return children;
}

export default ProtectedRoute;
