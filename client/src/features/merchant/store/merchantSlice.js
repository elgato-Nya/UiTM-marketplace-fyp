import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import merchantService from "../service/merchantService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";

/**
 * Merchant Redux Slice
 *
 * PURPOSE: Manage merchant shop state
 * STATE: Shop profile, stats, loading states, errors
 */

const initialState = {
  // Current merchant's shop
  shop: null,
  shopStats: null,

  // Public shop view (when viewing other merchants)
  viewedShop: null,

  // Search results
  searchResults: [],
  searchPagination: null,

  // Loading states
  isLoading: false,
  isUpdating: false,
  isLoadingStats: false,

  // Flags
  isNewShop: false, // True if shop was just auto-created

  // Error and success messages
  error: null,
  success: null,
};

// ==================== ASYNC THUNKS ====================

/**
 * Fetch current user's shop (auto-creates if needed)
 */
export const fetchMyShop = createAsyncThunk(
  "merchant/fetchMyShop",
  async (_, { rejectWithValue }) => {
    try {
      const response = await merchantService.getMyShop();
      return {
        shop: response.data.merchantDetails,
        user: response.data.user,
        isNew: response.data.isNew || false,
      };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load shop. Please try again.")
      );
    }
  }
);

/**
 * Update shop details
 */
export const updateShop = createAsyncThunk(
  "merchant/updateShop",
  async (shopData, { rejectWithValue }) => {
    try {
      const response = await merchantService.updateShop(shopData);
      return {
        shop: response.data.merchantDetails,
        user: response.data.user,
      };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to update shop. Please check your input and try again."
        )
      );
    }
  }
);

/**
 * Fetch shop statistics
 */
export const fetchShopStats = createAsyncThunk(
  "merchant/fetchShopStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await merchantService.getShopStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load shop statistics.")
      );
    }
  }
);

/**
 * Fetch shop by slug (public view)
 */
export const fetchShopBySlug = createAsyncThunk(
  "merchant/fetchShopBySlug",
  async (shopSlug, { rejectWithValue }) => {
    try {
      const response = await merchantService.getShopBySlug(shopSlug);
      return {
        shop: response.data.shop,
        merchant: response.data.merchant,
      };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Shop not found or is no longer available.")
      );
    }
  }
);

/**
 * Search merchants
 */
export const searchMerchants = createAsyncThunk(
  "merchant/searchMerchants",
  async (params, { rejectWithValue }) => {
    try {
      const response = await merchantService.searchMerchants(params);
      return {
        merchants: response.data.merchants,
        pagination: response.data.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to search merchants.")
      );
    }
  }
);

/**
 * Sync merchant data to all listings (manual trigger)
 */
export const syncMerchantListings = createAsyncThunk(
  "merchant/syncListings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await merchantService.syncListings();
      return {
        updatedCount: response.data.updatedCount,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to sync listings.")
      );
    }
  }
);

// ==================== SLICE ====================

const merchantSlice = createSlice({
  name: "merchant",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearViewedShop: (state) => {
      state.viewedShop = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = null;
    },
    // Update shop locally (optimistic update)
    updateShopLocally: (state, action) => {
      if (state.shop) {
        state.shop = { ...state.shop, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Shop
      .addCase(fetchMyShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload.shop;
        state.isNewShop = action.payload.isNew;
        state.error = null;

        if (action.payload.isNew) {
          state.success = {
            message: "Shop created successfully! You can now customize it.",
          };
        }
      })
      .addCase(fetchMyShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Shop
      .addCase(updateShop.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateShop.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.shop = action.payload.shop;
        state.success = { message: "Shop updated successfully!" };
        state.error = null;
      })
      .addCase(updateShop.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Fetch Shop Stats
      .addCase(fetchShopStats.pending, (state) => {
        state.isLoadingStats = true;
      })
      .addCase(fetchShopStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.shopStats = action.payload;
        state.error = null;
      })
      .addCase(fetchShopStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload;
      })

      // Fetch Shop By Slug (public view)
      .addCase(fetchShopBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShopBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewedShop = {
          shop: action.payload.shop,
          merchant: action.payload.merchant,
        };
        state.error = null;
      })
      .addCase(fetchShopBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Search Merchants
      .addCase(searchMerchants.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchMerchants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.merchants;
        state.searchPagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(searchMerchants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Sync Merchant Listings
      .addCase(syncMerchantListings.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(syncMerchantListings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.success = {
          message: `Successfully synced ${action.payload.updatedCount} listing(s)!`,
        };
        state.error = null;
      })
      .addCase(syncMerchantListings.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

// ==================== EXPORTS ====================

export const {
  clearError,
  clearSuccess,
  clearMessages,
  clearViewedShop,
  clearSearchResults,
  updateShopLocally,
} = merchantSlice.actions;

// Selectors
export const selectMerchant = (state) => state.merchant;
export const selectShop = (state) => state.merchant.shop;
export const selectShopStats = (state) => state.merchant.shopStats;
export const selectViewedShop = (state) => state.merchant.viewedShop;
export const selectSearchResults = (state) => state.merchant.searchResults;
export const selectMerchantLoading = (state) => state.merchant.isLoading;
export const selectMerchantUpdating = (state) => state.merchant.isUpdating;
export const selectMerchantError = (state) => state.merchant.error;
export const selectMerchantSuccess = (state) => state.merchant.success;
export const selectIsNewShop = (state) => state.merchant.isNewShop;

export default merchantSlice.reducer;
