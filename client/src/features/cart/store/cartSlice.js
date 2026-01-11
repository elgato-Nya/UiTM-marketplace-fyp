import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import cartService from "../service/cartService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";

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
      return rejectWithValue(
        extractThunkError(error, "Failed to load your cart.")
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ listingId, quantity, variantId = null }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(
        listingId,
        quantity,
        variantId
      );

      // Note: No need to refresh wishlist - the backend returns updated cart state
      // and UI components should use their own state (isInCart, isInWishlist)

      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to add item to cart. Please try again."
        )
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ listingId, quantity, variantId = null }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(
        listingId,
        quantity,
        variantId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to update cart. Please try again.")
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ listingId, variantId = null }, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(listingId, variantId);

      // Note: No need to refresh wishlist - item removal doesn't affect wishlist state

      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to remove item from cart.")
      );
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
      return rejectWithValue(extractThunkError(error, "Failed to clear cart."));
    }
  }
);

export const moveToWishlist = createAsyncThunk(
  "cart/moveToWishlist",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await cartService.moveToWishlist(listingId);

      // Note: The backend handles moving the item to wishlist
      // The response includes updated cart state
      // Wishlist will be fetched when user navigates to wishlist page

      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to move item to wishlist.")
      );
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
      const { listingId, quantity, variantId = null } = action.payload;

      if (!state.cart?.items) return;

      const itemIndex = state.cart.items.findIndex((item) => {
        const itemListingId = item.listing?._id;
        const itemVariantId = item.variantId;
        const listingMatch =
          itemListingId?.toString() === listingId?.toString();
        // If variantId is specified, must match; otherwise, match items without variant
        const variantMatch = variantId
          ? itemVariantId?.toString() === variantId?.toString()
          : !itemVariantId;
        return listingMatch && variantMatch;
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
