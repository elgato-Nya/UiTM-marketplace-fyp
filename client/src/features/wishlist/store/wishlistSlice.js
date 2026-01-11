import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import wishlistService from "../service/wishlistService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";

const initialState = {
  wishlist: null,
  summary: { totalItems: 0 },
  isLoading: false,
  error: null,
  success: false,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load your wishlist.")
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.addToWishlist(listingId);

      // Note: No need to refresh cart - adding to wishlist doesn't affect cart state

      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to add item to wishlist.")
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeFromWishlist(listingId);

      // Note: No need to refresh cart - removing from wishlist doesn't affect cart state

      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to remove item from wishlist.")
      );
    }
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.clearWishlist();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to clear wishlist.")
      );
    }
  }
);

export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async ({ listingId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      const response = await wishlistService.moveToCart(listingId, quantity);

      // After moving to cart, refresh cart state to show the new item
      // Use dynamic import to avoid circular dependency
      const { fetchCart } = await import("../../cart/store/cartSlice");
      dispatch(fetchCart());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to move item to cart.")
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetWishlist: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.wishlist = data.wishlist;
        state.summary = data.summary;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || { message: "Failed to fetch wishlist" };
      })

      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.wishlist = data.wishlist;
        state.summary = data.summary;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || {
          message: "Failed to add to wishlist",
        };
      })

      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.wishlist = data.wishlist;
        state.summary = data.summary;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || {
          message: "Failed to remove from wishlist",
        };
      })

      // Clear Wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.wishlist = data.wishlist;
        state.summary = data.summary;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || { message: "Failed to clear wishlist" };
      })

      // Move to Cart
      .addCase(moveToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.wishlist = data.wishlist;
        state.summary = data.summary;
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || { message: "Failed to move to cart" };
      });
  },
});

export const { clearError, clearSuccess, resetWishlist } =
  wishlistSlice.actions;

// Selectors
export const selectWishlist = (state) => state.wishlist.wishlist;
export const selectWishlistSummary = (state) => state.wishlist.summary;
export const selectWishlistLoading = (state) => state.wishlist.isLoading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectWishlistItemCount = (state) =>
  state.wishlist.summary.totalItems;

export default wishlistSlice.reducer;
