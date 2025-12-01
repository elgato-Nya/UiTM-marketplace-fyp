import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import wishlistService from "../service/wishlistService";
const { fetchCart } = await import("../../cart/store/cartSlice");

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
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch wishlist",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (listingId, { rejectWithValue, dispatch }) => {
    try {
      const response = await wishlistService.addToWishlist(listingId);

      // After adding to wishlist, refresh cart to update UI state
      const { fetchCart } = await import("../../cart/store/cartSlice");
      dispatch(fetchCart());

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to add to wishlist",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (listingId, { rejectWithValue, dispatch }) => {
    try {
      const response = await wishlistService.removeFromWishlist(listingId);

      // After removing from wishlist, refresh cart to update UI state
      const { fetchCart } = await import("../../cart/store/cartSlice");
      dispatch(fetchCart());

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to remove from wishlist",
        status: error.response?.status,
        details: error.response?.data || null,
      });
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
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to clear wishlist",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async ({ listingId, quantity }, { rejectWithValue, dispatch }) => {
    console.log(
      "999999999999999999999999999999 Moving to cart:",
      listingId,
      quantity
    );
    try {
      const response = await wishlistService.moveToCart(listingId, quantity);

      // After moving to cart, we need to refresh the cart state
      dispatch(fetchCart());

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to move to cart",
        status: error.response?.status,
        details: error.response?.data || null,
      });
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
        console.log(
          "2222222222222222222222222222222Moved to cart successfully:",
          action.payload
        );
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.wishlist = data.wishlist;
        state.summary = data.summary;
      })
      .addCase(moveToCart.rejected, (state, action) => {
        console.log(
          "33333333333333333333333333333Failed to move to cart:",
          action.payload
        );
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
