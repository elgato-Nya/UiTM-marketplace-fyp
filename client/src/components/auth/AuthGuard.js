import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/useAuth";

/**
 * AuthGuard - Redirects authenticated users away from auth pages
 *
 * @param {Object} props
 * @param {React.Component} props.children - The component to render if not authenticated
 * @param {string} props.redirectTo - Where to redirect authenticated users (default: "/")
 */
function AuthGuard({ children, redirectTo = "/" }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Don't redirect while loading
  if (isLoading) {
    return children;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
}

export default AuthGuard;
