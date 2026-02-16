import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import payoutService from "../service/payoutService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";

const initialState = {
  // Balance info
  balance: {
    available: 0,
    pending: 0,
    total: 0,
    totalEarned: 0,
    totalPaidOut: 0,
  },

  // Settings
  payoutSettings: {
    schedule: "manual",
    autoPayoutEnabled: false,
    minimumPayoutAmount: 10,
  },

  // Bank details (masked)
  bankDetails: {
    bankName: null,
    accountNumber: null,
    accountHolderName: null,
    isVerified: false,
  },

  // Payout capability
  canRequestPayout: false,
  daysUntilForcedPayout: null,
  nextScheduledPayout: null,

  // Transactions
  transactions: {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  },

  // Payout history
  payoutHistory: {
    payouts: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // Current payout detail
  currentPayout: null,

  // Loading states
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// -------------------------------------------
// Async thunks
// -------------------------------------------

export const fetchBalance = createAsyncThunk(
  "payout/fetchBalance",
  async (params, { rejectWithValue }) => {
    try {
      const response = await payoutService.getBalance(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load balance"),
      );
    }
  },
);

export const updatePayoutSettings = createAsyncThunk(
  "payout/updatePayoutSettings",
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await payoutService.updatePayoutSettings(settingsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to update payout settings"),
      );
    }
  },
);

export const updateBankDetails = createAsyncThunk(
  "payout/updateBankDetails",
  async (bankData, { rejectWithValue }) => {
    try {
      const response = await payoutService.updateBankDetails(bankData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to update bank details"),
      );
    }
  },
);

export const requestPayout = createAsyncThunk(
  "payout/requestPayout",
  async (payoutData, { rejectWithValue }) => {
    try {
      const response = await payoutService.requestPayout(payoutData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to request payout"),
      );
    }
  },
);

export const fetchPayoutHistory = createAsyncThunk(
  "payout/fetchPayoutHistory",
  async (params, { rejectWithValue }) => {
    try {
      const response = await payoutService.getPayoutHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load payout history"),
      );
    }
  },
);

export const fetchPayoutById = createAsyncThunk(
  "payout/fetchPayoutById",
  async (payoutId, { rejectWithValue }) => {
    try {
      const response = await payoutService.getPayoutById(payoutId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load payout details"),
      );
    }
  },
);

export const cancelPayout = createAsyncThunk(
  "payout/cancelPayout",
  async (payoutId, { rejectWithValue }) => {
    try {
      const response = await payoutService.cancelPayout(payoutId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to cancel payout"),
      );
    }
  },
);

// -------------------------------------------
// Slice
// -------------------------------------------

const payoutSlice = createSlice({
  name: "payout",
  initialState,
  reducers: {
    clearCurrentPayout: (state) => {
      state.currentPayout = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPayoutState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch balance
      .addCase(fetchBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        // Server spreads data directly into response (not wrapped in .data)
        const data = action.payload;
        state.balance = data.balance || initialState.balance;
        state.payoutSettings =
          data.payoutSettings || initialState.payoutSettings;
        state.bankDetails = data.bankDetails || initialState.bankDetails;
        state.canRequestPayout = data.canRequestPayout || false;
        state.daysUntilForcedPayout = data.daysUntilForcedPayout;
        state.nextScheduledPayout = data.nextScheduledPayout;
        if (data.transactions) {
          state.transactions = data.transactions;
        }
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update payout settings
      .addCase(updatePayoutSettings.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updatePayoutSettings.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns settings directly
        state.payoutSettings = action.payload || state.payoutSettings;
      })
      .addCase(updatePayoutSettings.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Update bank details
      .addCase(updateBankDetails.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateBankDetails.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns bank details spread directly into response
        const { success, message, timestamp, ...bankDetails } = action.payload;
        state.bankDetails = {
          ...state.bankDetails,
          ...bankDetails,
        };
      })
      .addCase(updateBankDetails.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Request payout
      .addCase(requestPayout.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(requestPayout.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns payout directly
        const payout = action.payload.payout || action.payload;
        state.payoutHistory.payouts.unshift(payout);
        state.payoutHistory.total += 1;
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Fetch payout history
      .addCase(fetchPayoutHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayoutHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        // Server spreads data directly
        const data = action.payload;
        state.payoutHistory = {
          payouts: data.payouts || [],
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 10,
          totalPages: data.totalPages || 1,
        };
      })
      .addCase(fetchPayoutHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch payout by ID
      .addCase(fetchPayoutById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayoutById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Server returns payout directly
        state.currentPayout = action.payload.payout || action.payload;
      })
      .addCase(fetchPayoutById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cancel payout
      .addCase(cancelPayout.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(cancelPayout.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns payout directly
        const updatedPayout = action.payload.payout || action.payload;
        const index = state.payoutHistory.payouts.findIndex(
          (p) => p._id === updatedPayout._id,
        );
        if (index !== -1) {
          state.payoutHistory.payouts[index] = updatedPayout;
        }
        if (state.currentPayout?._id === updatedPayout._id) {
          state.currentPayout = updatedPayout;
        }
      })
      .addCase(cancelPayout.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPayout, clearError, resetPayoutState } =
  payoutSlice.actions;

export default payoutSlice.reducer;
