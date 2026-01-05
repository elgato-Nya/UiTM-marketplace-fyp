import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setTokens } from "../../auth/store/authSlice";

// TODO: fucking check why i suddenly have this file
/**
 * Listing API - RTK Query
 *
 * PURPOSE: Centralized API for listing operations with automatic caching
 * BENEFITS:
 * - Automatic request deduplication
 * - Built-in caching (60 seconds default)
 * - Loading/error states handled automatically
 * - No duplicate requests for same params
 * - Optimistic updates support
 * - Automatic token refresh on 401 errors
 *
 * USAGE:
 * const { data, isLoading, error } = useGetListingsQuery({ limit: 10 });
 */

const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Base query with standard configuration
const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state (same as axios instance)
    const token = getState().auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    // Add other headers for consistency with axios
    headers.set("Accept", "application/json");
    headers.set("X-Requested-With", "XMLHttpRequest");
    return headers;
  },
  credentials: "include", // Include cookies (same as withCredentials: true)
});

// Track if a token refresh is already in progress
let isRefreshing = false;
let refreshPromise = null;

/**
 * Base query with automatic token refresh
 * Wraps the raw base query to handle 401 errors by refreshing the token
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    // Check if this is the refresh endpoint itself
    const isRefreshRequest =
      typeof args === "string"
        ? args.includes("/auth/refresh-token")
        : args.url?.includes("/auth/refresh-token");

    if (!isRefreshRequest) {
      // If refresh is already in progress, wait for it
      if (isRefreshing && refreshPromise) {
        try {
          await refreshPromise;
          // Retry the original request with new token
          result = await rawBaseQuery(args, api, extraOptions);
        } catch {
          // Refresh failed, return original error
          return result;
        }
      } else {
        // Start the refresh process
        isRefreshing = true;
        refreshPromise = (async () => {
          try {
            const refreshResult = await rawBaseQuery(
              {
                url: "/auth/refresh-token",
                method: "POST",
                body: {},
              },
              api,
              extraOptions
            );

            if (refreshResult.data?.success && refreshResult.data?.token) {
              const { token, email, roles, profile } = refreshResult.data;

              // Update store with new token
              api.dispatch(
                setTokens({
                  token: token,
                  refreshToken: api.getState().auth?.refreshToken,
                })
              );

              // Also update the auth state with fresh user data
              api.dispatch({
                type: "auth/restoreSession",
                payload: {
                  user: { email, profile },
                  token,
                  roles: roles || ["consumer"],
                  isAuthenticated: true,
                },
              });

              return token;
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (refreshError) {
            // Clear auth state on refresh failure
            api.dispatch({ type: "auth/clearAuth" });

            // Redirect to login for protected routes
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

            if (!isPublicPage) {
              setTimeout(() => {
                window.location.href = "/login?expired=true";
              }, 100);
            }

            throw refreshError;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();

        try {
          await refreshPromise;
          // Retry the original request with new token
          result = await rawBaseQuery(args, api, extraOptions);
        } catch {
          // Refresh failed, return original error
          return result;
        }
      }
    }
  }

  return result;
};

export const listingApi = createApi({
  reducerPath: "listingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Listing", "MyListings"],
  endpoints: (builder) => ({
    // Get all public listings with caching
    getListings: builder.query({
      query: (params = {}) => ({
        url: "/listings",
        params,
      }),
      providesTags: ["Listing"],
      keepUnusedDataFor: 60, // Cache for 60 seconds
      transformResponse: (response) => {
        // Normalize response structure - API returns { listings: [...], pagination: {...} }
        return response.listings || [];
      },
    }),

    // Get listing by ID
    getListingById: builder.query({
      query: (id) => `/listings/${id}`,
      providesTags: (result, error, id) => [{ type: "Listing", id }],
      keepUnusedDataFor: 300, // Cache listing details for 5 minutes
    }),

    // Get current user's listings
    getMyListings: builder.query({
      query: (params = {}) => ({
        url: "/listings/my-listings",
        params,
      }),
      providesTags: ["MyListings"],
      keepUnusedDataFor: 30,
      transformResponse: (response) => {
        return {
          listings: response.listings || [],
          pagination: response.pagination || {},
        };
      },
    }),

    // Get seller listings
    getSellerListings: builder.query({
      query: ({ sellerId, params = {} }) => ({
        url: `/listings/seller/${sellerId}`,
        params,
      }),
      providesTags: (result, error, { sellerId }) => [
        { type: "Listing", id: `seller-${sellerId}` },
      ],
      keepUnusedDataFor: 60,
    }),

    // Create listing (mutation)
    createListing: builder.mutation({
      query: (body) => ({
        url: "/listings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Listing", "MyListings"],
    }),

    // Update listing (mutation)
    updateListing: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/listings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Listing", id },
        "MyListings",
      ],
    }),

    // Delete listing (mutation)
    deleteListing: builder.mutation({
      query: ({ id, permanent = true }) => ({
        url: `/listings/${id}`,
        method: "DELETE",
        params: { permanent: permanent.toString() },
      }),
      invalidatesTags: ["Listing", "MyListings"],
    }),

    // Toggle availability (mutation)
    toggleAvailability: builder.mutation({
      query: (id) => ({
        url: `/listings/toggle-availability/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Listing", id },
        "MyListings",
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetListingsQuery,
  useGetListingByIdQuery,
  useGetMyListingsQuery,
  useGetSellerListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useToggleAvailabilityMutation,
} = listingApi;
