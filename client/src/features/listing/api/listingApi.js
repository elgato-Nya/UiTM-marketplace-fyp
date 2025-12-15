import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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
 *
 * USAGE:
 * const { data, isLoading, error } = useGetListingsQuery({ limit: 10 });
 */
export const listingApi = createApi({
  reducerPath: "listingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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
  }),
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
