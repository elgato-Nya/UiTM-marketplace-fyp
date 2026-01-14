import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkoutService } from "../service/checkoutService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";
/**
 * Checkout Slice
 *
 * PURPOSE: Manage checkout session state
 * PATTERN: Follows your cartSlice and orderSlice patterns
 * STATE: session, loading, error, paymentIntent, orders
 */

const initialState = {
  session: null,
  paymentIntent: null,
  orders: [],
  isLoading: false,
  error: null,
  success: false,
  sessionExpired: false,
  isConfirming: false,
};

/**
 * Create checkout session from cart
 */
export const createSessionFromCart = createAsyncThunk(
  "checkout/createSessionFromCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkoutService.createSessionFromCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to create checkout session. Please check your cart and try again."
        )
      );
    }
  }
);

/**
 * Create checkout session from direct purchase (Buy Now)
 */
export const createSessionFromListing = createAsyncThunk(
  "checkout/createSessionFromListing",
  async ({ listingId, quantity, variantId }, { rejectWithValue }) => {
    try {
      const response = await checkoutService.createSessionFromListing({
        listingId,
        quantity,
        variantId: variantId || null,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to initiate purchase. Please try again."
        )
      );
    }
  }
);

/**
 * Get active checkout session
 */
export const getActiveSession = createAsyncThunk(
  "checkout/getActiveSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkoutService.getActiveSession();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to fetch your checkout session.")
      );
    }
  }
);

/**
 * Update checkout session
 */
export const updateSession = createAsyncThunk(
  "checkout/updateSession",
  async ({ sessionId, data }, { rejectWithValue }) => {
    try {
      const response = await checkoutService.updateSession(sessionId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to update checkout session.")
      );
    }
  }
);

/**
 * Cancel checkout session
 */
export const cancelSession = createAsyncThunk(
  "checkout/cancelSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await checkoutService.cancelSession(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to cancel checkout session.")
      );
    }
  }
);

/**
 * Create Stripe payment intent
 */
export const createPaymentIntent = createAsyncThunk(
  "checkout/createPaymentIntent",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await checkoutService.createPaymentIntent(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to initialize payment. Please try again."
        )
      );
    }
  }
);

/**
 * Confirm checkout and create orders
 */
export const confirmCheckout = createAsyncThunk(
  "checkout/confirmCheckout",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await checkoutService.confirmCheckout(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(
          error,
          "Failed to confirm your order. Please contact support if payment was charged."
        )
      );
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    /**
     * Clear checkout state (after success or cancel)
     */
    clearCheckout: (state) => {
      state.session = null;
      state.paymentIntent = null;
      state.orders = [];
      state.error = null;
      state.sessionExpired = false;
      state.isConfirming = false;
    },

    /**
     * Mark session as expired (called by timer)
     */
    markSessionExpired: (state) => {
      state.sessionExpired = true;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Clear success flag
     */
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Create session from cart
    builder
      .addCase(createSessionFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSessionFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.sessionExpired = false;
      })
      .addCase(createSessionFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create session from listing
    builder
      .addCase(createSessionFromListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSessionFromListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.sessionExpired = false;
      })
      .addCase(createSessionFromListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get active session
    builder
      .addCase(getActiveSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActiveSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.sessionExpired = !action.payload.session; // Mark expired if no session
      })
      .addCase(getActiveSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update session
    builder
      .addCase(updateSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Cancel session
    builder
      .addCase(cancelSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSession.fulfilled, (state) => {
        state.isLoading = false;
        state.session = null;
        state.paymentIntent = null;
      })
      .addCase(cancelSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create payment intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Confirm checkout
    builder
      .addCase(confirmCheckout.pending, (state) => {
        state.isConfirming = true;
        state.error = null;
      })
      .addCase(confirmCheckout.fulfilled, (state, action) => {
        state.isConfirming = false;
        state.orders = action.payload.orders;
        state.session = null; // Session completed
      })
      .addCase(confirmCheckout.rejected, (state, action) => {
        state.isConfirming = false;
        state.error = action.payload;
      });
  },
});

// ==================== ACTIONS ====================

export const { clearCheckout, markSessionExpired, clearError, clearSuccess } =
  checkoutSlice.actions;

// ==================== SELECTORS ====================

export const selectCheckoutSession = (state) => state.checkout.session;
export const selectCheckoutLoading = (state) => state.checkout.loading;
export const selectCheckoutError = (state) => state.checkout.error;
export const selectPaymentIntent = (state) => state.checkout.paymentIntent;
export const selectCheckoutOrders = (state) => state.checkout.orders;
export const selectSessionExpired = (state) => state.checkout.sessionExpired;
export const selectIsConfirming = (state) => state.checkout.isConfirming;

// Derived selectors
export const selectHasActiveSession = (state) => !!state.checkout.session;
export const selectSessionId = (state) => state.checkout.session?._id;
export const selectSessionType = (state) => state.checkout.session?.sessionType;
export const selectSessionItems = (state) =>
  state.checkout.session?.items || [];
export const selectSellerGroups = (state) =>
  state.checkout.session?.sellerGroups || [];
export const selectPricing = (state) => state.checkout.session?.pricing;
export const selectDeliveryMethod = (state) =>
  state.checkout.session?.deliveryMethod;
export const selectDeliveryAddress = (state) =>
  state.checkout.session?.deliveryAddress;
export const selectPaymentMethod = (state) =>
  state.checkout.session?.paymentMethod;
export const selectSessionExpiresAt = (state) =>
  state.checkout.session?.expiresAt;

export default checkoutSlice.reducer;
