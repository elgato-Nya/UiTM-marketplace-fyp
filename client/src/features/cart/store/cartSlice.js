import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import cartService from "../service/cartService";

const initialState = {
  cart: null,
  summary: {
    totalItems: 0,
    totalItemsQuantity: 0,
    totalPrice: 0,
  },
  isLoading: false,
  error: null,
  success: false,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch cart",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ listingId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.addToCart(listingId, quantity);

      // After adding to cart, refresh wishlist to update UI state (heart icons, etc.)
      const { fetchWishlist } = await import(
        "../../wishlist/store/wishlistSlice"
      );
      dispatch(fetchWishlist());

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to add to cart",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ listingId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(listingId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update cart item",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (listingId, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.removeFromCart(listingId);

      // After removing from cart, refresh wishlist to update UI state
      const { fetchWishlist } = await import(
        "../../wishlist/store/wishlistSlice"
      );
      dispatch(fetchWishlist());

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to remove from cart",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to clear cart",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

export const moveToWishlist = createAsyncThunk(
  "cart/moveToWishlist",
  async (listingId, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.moveToWishlist(listingId);

      // After moving to wishlist, we need to refresh the wishlist state
      // Import fetchWishlist from wishlist slice dynamically to avoid circular dependency
      const { fetchWishlist } = await import(
        "../../wishlist/store/wishlistSlice"
      );
      dispatch(fetchWishlist());

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to move to wishlist",
        status: error.response?.status,
        details: error.response?.data || null,
      });
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = false;
    },

    resetCartState: () => initialState,

    // Optimistic local update for quantity changes (no loading state)
    updateQuantityOptimistic: (state, action) => {
      const { listingId, quantity } = action.payload;

      if (!state.cart?.items) return;

      const itemIndex = state.cart.items.findIndex((item) => {
        const itemListingId = item.listing?._id;
        return itemListingId?.toString() === listingId?.toString();
      });

      if (itemIndex !== -1) {
        const item = state.cart.items[itemIndex];
        const oldQuantity = item.quantity;
        const price = item.priceWhenAdded;

        // Update item quantity
        item.quantity = quantity;

        // Recalculate summary accurately
        state.summary.totalItemsQuantity = state.cart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        state.summary.totalPrice = state.cart.items.reduce(
          (sum, item) => sum + item.priceWhenAdded * item.quantity,
          0
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data || action.payload;
        state.cart = data.cart;
        state.summary = data.summary;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to fetch cart" };
      })

      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.cart = data.cart;
        state.summary = data.summary;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to add to cart" };
      })

      // updateCartItem - Don't set loading for optimistic updates
      .addCase(updateCartItem.pending, (state) => {
        // Remove isLoading = true for better UX
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data || action.payload;
        state.cart = data.cart;
        state.summary = data.summary;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to update cart item",
        };
        // Revert optimistic update by refetching cart
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const data = action.payload.data || action.payload;
        state.cart = data.cart;
        state.summary = data.summary;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to remove from cart",
        };
      }) // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data || action.payload;
        state.cart = data.cart;
        state.summary = data.summary;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to clear cart" };
      })

      // Move to Wishlist
      .addCase(moveToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data || action.payload;
        state.cart = data.cart;
        state.summary = data.summary;
      })
      .addCase(moveToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to move to wishlist",
        };
      });
  },
});

export const {
  clearError,
  clearSuccess,
  resetCartState,
  updateQuantityOptimistic,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartSummary = (state) => state.cart.summary;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;
export const selectCartItemCount = (state) => state.cart.summary.totalItems;

export default cartSlice.reducer;
