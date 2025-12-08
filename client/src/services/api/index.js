import axios from "axios";
import { store } from "../../store";
import { logout, setTokens } from "../../features/auth/store/authSlice";

// Request deduplication cache
const pendingRequests = new Map();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 30000, // Increased to 30 seconds for image uploads
  withCredentials: true, // Include cookies for cross-origin requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // CSRF protection
  },
});

// Request interceptor to add auth token and validate authentication
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;
    const isAuthenticated = state.auth?.isAuthenticated;

    // Create unique request key for deduplication (excluding refresh token requests)
    if (!config.url?.includes("/auth/refresh-token")) {
      const requestKey = `${config.method?.toUpperCase()}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;

      // If same request is already pending, return the existing promise
      if (pendingRequests.has(requestKey)) {
        console.log(`Deduplicating request: ${requestKey}`);
        return pendingRequests.get(requestKey);
      }

      // Store the request promise for deduplication
      config._requestKey = requestKey;
    }

    // Add auth token if available (but don't block the request)
    // Let the server decide if authentication is required
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if a token refresh is already in progress
let isRefreshing = false;
let refreshPromise = null;

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Clean up pending request from deduplication cache
    if (response.config._requestKey) {
      pendingRequests.delete(response.config._requestKey);
    }
    return response;
  },
  async (error) => {
    // Clean up pending request from deduplication cache
    if (error.config?._requestKey) {
      pendingRequests.delete(error.config._requestKey);
    }
    const originalRequest = error.config;

    // Handle token expiration (401) or refresh in progress (429)
    if (
      (error.response?.status === 401 || error.response?.status === 429) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If refresh is already in progress, wait for it
      if (isRefreshing && refreshPromise) {
        try {
          const token = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      // Start the refresh process
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          // Try to refresh token using the same approach as sessionRestorer
          // This uses cookies for refresh token (more secure)
          const refreshResponse = await axios.post(
            `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
            {}, // Empty body - server will use refresh token from cookies
            {
              withCredentials: true, // Important: include cookies
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (refreshResponse.data.success && refreshResponse.data.token) {
            const { token, email, roles, profile } = refreshResponse.data;
            const user = { email, profile };

            // Update store with new token and user data
            store.dispatch(
              setTokens({
                token: token,
                refreshToken: store.getState().auth?.refreshToken, // Keep existing refresh token
              })
            );

            // Also update the auth state with fresh user data
            store.dispatch({
              type: "auth/restoreSession",
              payload: {
                user,
                token,
                roles: roles || ["consumer"],
                isAuthenticated: true,
              },
            });

            return token;
          } else {
            throw new Error("Token refresh failed: No token in response");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          // Clear any stored tokens immediately
          try {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
          } catch (e) {
            console.warn("Failed to clear localStorage:", e);
          }

          // Clear auth state immediately
          store.dispatch({
            type: "auth/clearAuth",
          });

          // Only redirect to login if user was trying to access protected routes
          // Don't redirect if on public pages (home, browse, listing details, login, register)
          const publicPaths = [
            "/",
            "/browse",
            "/listings",
            "/login",
            "/register",
            "/auth",
          ];
          const currentPath = window.location.pathname;
          const isPublicPage = publicPaths.some(
            (path) => currentPath === path || currentPath.startsWith(path)
          );

          setTimeout(() => {
            if (!isPublicPage) {
              window.location.href = "/login?expired=true";
            }
          }, 100);

          throw refreshError;
        } finally {
          // Reset refresh state
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      try {
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
