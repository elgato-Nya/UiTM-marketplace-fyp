import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import listingService from "../service/listingService";

const initialState = {
  listings: [],
  myListings: [],
  currentListing: null,
  isLoading: false,
  error: null,
  success: false,
  filters: { type: null, category: null, search: "", sort: "-createdAt" },
  pagination: { currentPage: 1, totalPages: 1, totalListings: 0, limit: 24 },
};

export const createListing = createAsyncThunk(
  "listings/createListing",
  async (listingData, { rejectWithValue }) => {
    try {
      const response = await listingService.createListing(listingData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create listing",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

// Alias for consistency with hook usage
export const fetchListings = createAsyncThunk(
  "listings/fetchListings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await listingService.getAllListings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch listings",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

// Keep the old name for backwards compatibility
export const fetchAllListings = fetchListings;

export const fetchListingById = createAsyncThunk(
  "listings/fetchListingById",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await listingService.getListingById(listingId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch listing",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const fetchMyListings = createAsyncThunk(
  "listings/fetchMyListings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await listingService.getMyListings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch my listings",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const fetchSellerListings = createAsyncThunk(
  "listings/fetchSellerListings",
  async ({ sellerId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await listingService.getSellerListings(sellerId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch seller listings",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const updateListing = createAsyncThunk(
  "listings/updateListing",
  async ({ listingId, updates }, { rejectWithValue }) => {
    try {
      const response = await listingService.updateListing(listingId, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update listing",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const deleteListing = createAsyncThunk(
  "listings/deleteListing",
  async ({ listingId, isPermanent = false }, { rejectWithValue }) => {
    try {
      const response = await listingService.deleteListing(
        listingId,
        isPermanent
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete listing",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const toggleListingAvailability = createAsyncThunk(
  "listings/toggleListingAvailability",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await listingService.toggleAvailability(listingId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update availability with toggle",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    clearCurrentListing: (state) => {
      state.currentListing = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = false;
    },

    resetListingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create Listing
      .addCase(createListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const listing = action.payload.listing;
        state.myListings.unshift(listing);
      })
      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to create listing" };
      })

      // Fetch All Listings (handles both fetchListings and fetchAllListings)
      .addCase(fetchListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.listings = data.listings || [];
        state.pagination = data.pagination || state.pagination;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to fetch listings" };
      })

      // Fetch Listing By ID
      .addCase(fetchListingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.isLoading = false;
        const listing = action.payload.listing;
        state.currentListing = listing;
      })
      .addCase(fetchListingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to fetch listing" };
      })

      // Fetch Seller Listings
      .addCase(fetchSellerListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerListings.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.listings = data.listings || [];
        state.pagination = data.pagination;
      })
      .addCase(fetchSellerListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to fetch seller listings",
        };
      })

      // Fetch My Listings
      .addCase(fetchMyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.myListings = data.listings || [];
        state.pagination = data.pagination;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to fetch my listings",
        };
      })

      // Update Listing
      .addCase(updateListing.pending, (state) => {
        state.isLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const updatedListing = action.payload.updatedListing;

        // Update in myListings
        const index = state.myListings.findIndex(
          (listing) => listing._id === updatedListing._id
        );
        if (index !== -1) {
          state.myListings[index] = updatedListing;
        }

        // Update currentListing if it's the same
        if (state.currentListing?._id === updatedListing._id) {
          state.currentListing = updatedListing;
        }
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to update listing" };
      })

      // Delete Listing
      .addCase(deleteListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // The payload contains the listing ID
        const listingId = action.payload._id;
        const isPermanent = action.payload.isPermanent;

        // Only remove from array if permanent delete
        // For soft delete, let the refetch handle it
        if (isPermanent) {
          state.myListings = state.myListings.filter(
            (listing) => listing._id !== listingId
          );
        }
      })

      // Toggle Listing Availability
      .addCase(toggleListingAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleListingAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const updatedInfo = action.payload;
        const listingId = updatedInfo._id;

        // Update in myListings
        const index = state.myListings.findIndex(
          (listing) => listing._id === listingId
        );
        if (index !== -1) {
          state.myListings[index].isAvailable = updatedInfo.isAvailable;
        }

        // Update currentListing if it's the same
        if (state.currentListing?._id === listingId) {
          state.currentListing.isAvailable = updatedInfo.isAvailable;
        }
      })
      .addCase(toggleListingAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to update availability with toggle",
        };
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearCurrentListing,
  clearError,
  clearSuccess,
  resetListingState,
} = listingSlice.actions;

export default listingSlice.reducer;
