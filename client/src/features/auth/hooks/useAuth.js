import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";

import {
  login,
  logout,
  register,
  handleRefreshToken,
  resetPassword,
  clearError,
  selectAuth,
  selectIsAuthenticated,
  selectCurrentUser,
  selectUserRoles,
  selectAuthLoading,
  selectAuthError,
  selectIsMerchant,
  selectIsAdmin,
  selectCanSell,
  selectCanAccessAdmin,
} from "../store/authSlice";
import { clearProfile } from "../../profile/store/profileSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const roles = useSelector(selectUserRoles);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Role and permission selectors
  const isConsumer = true;
  const isMerchant = useSelector(selectIsMerchant);
  const isAdmin = useSelector(selectIsAdmin);
  const canSell = useSelector(selectCanSell);
  const canAccessAdmin = useSelector(selectCanAccessAdmin);

  // Auth related actions
  const loginUser = useCallback(
    (credentials) => {
      return dispatch(login(credentials));
    },
    [dispatch]
  );

  const registerUser = useCallback(
    (userData) => {
      return dispatch(register(userData));
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    // Clear profile data first
    dispatch(clearProfile());
    // Then logout
    return dispatch(logout());
  }, [dispatch]);

  const refreshToken = useCallback(() => {
    return dispatch(handleRefreshToken());
  }, [dispatch]);

  const resetUserPassword = useCallback(
    (email, code, newPassword) => {
      return dispatch(resetPassword({ email, code, newPassword }));
    },
    [dispatch]
  );

  // Clear auth error
  const clearAuthError = useCallback(() => {
    return dispatch(clearError());
  }, [dispatch]);

  // Auto-refresh token 5 minutes before expiry
  useEffect(() => {
    if (auth.sessionExpiry && auth.token && isAuthenticated) {
      const expiryTime = new Date(auth.sessionExpiry).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Set timeout to refresh token 5 minute before expiry
      const refreshTime = timeUntilExpiry - 5 * 60 * 1000;

      // Only set up auto-refresh if we have at least 1 minute until refresh time
      if (refreshTime > 60 * 1000) {
        console.log(
          `Auto-refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`
        );

        const timer = setTimeout(() => {
          console.log("Auto-refresh triggered");
          dispatch(handleRefreshToken()).catch((error) => {
            // Silently handle auto-refresh errors - the API interceptor will handle logout
            console.warn("Auto-refresh failed:", error);
          });
        }, refreshTime);

        return () => {
          clearTimeout(timer);
          console.log("Auto-refresh timer cleared");
        };
      } else if (timeUntilExpiry < 0) {
        // Token already expired - let the API interceptor handle it on next request
        console.log("Token already expired, will refresh on next API call");
      }
    }
  }, [auth.sessionExpiry, auth.token, isAuthenticated, dispatch]);

  return {
    // State
    ...auth,
    isAuthenticated,
    user,
    roles,
    isLoading,
    error,

    // Roles and permissions
    isGuest: !isAuthenticated,
    isConsumer,
    isMerchant,
    isAdmin,
    canSell,
    canAccessAdmin,

    // Computed properties
    hasRole: (role) => roles.includes(role),
    hasAnyRole: (roleArray) => roleArray.some((role) => roles.includes(role)),
    hasAllRoles: (roleArray) => roleArray.every((role) => roles.includes(role)),

    // Actions
    loginUser,
    registerUser,
    logoutUser,
    refreshToken,
    resetUserPassword,
    clearAuthError,
  };
}
