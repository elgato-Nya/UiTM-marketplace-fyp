import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import quoteService from "../service/quoteService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";

const initialState = {
  // Quote lists
  buyerQuotes: [],
  sellerQuotes: [],

  // Single quote detail
  currentQuote: null,

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalQuotes: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Filters
  filters: {
    status: null,
    priority: null,
    sort: "-createdAt",
  },

  // Loading states
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// -------------------------------------------
// Async thunks
// -------------------------------------------

export const createQuoteRequest = createAsyncThunk(
  "quotes/createQuoteRequest",
  async (quoteData, { rejectWithValue }) => {
    try {
      const response = await quoteService.createQuoteRequest(quoteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to submit quote request"),
      );
    }
  },
);

export const fetchBuyerQuotes = createAsyncThunk(
  "quotes/fetchBuyerQuotes",
  async (params, { rejectWithValue }) => {
    try {
      const response = await quoteService.getMyQuotes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load your quote requests"),
      );
    }
  },
);

export const fetchSellerQuotes = createAsyncThunk(
  "quotes/fetchSellerQuotes",
  async (params, { rejectWithValue }) => {
    try {
      const response = await quoteService.getSellerQuotes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load quote requests"),
      );
    }
  },
);

export const fetchQuoteById = createAsyncThunk(
  "quotes/fetchQuoteById",
  async ({ quoteId, params }, { rejectWithValue }) => {
    try {
      const response = await quoteService.getQuoteById(quoteId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load quote details"),
      );
    }
  },
);

export const provideQuote = createAsyncThunk(
  "quotes/provideQuote",
  async ({ quoteId, quoteData }, { rejectWithValue }) => {
    try {
      const response = await quoteService.provideQuote(quoteId, quoteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to submit quote"),
      );
    }
  },
);

export const acceptQuote = createAsyncThunk(
  "quotes/acceptQuote",
  async ({ quoteId, acceptData }, { rejectWithValue }) => {
    try {
      const response = await quoteService.acceptQuote(quoteId, acceptData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to accept quote"),
      );
    }
  },
);

export const rejectQuote = createAsyncThunk(
  "quotes/rejectQuote",
  async ({ quoteId, rejectData }, { rejectWithValue }) => {
    try {
      const response = await quoteService.rejectQuote(quoteId, rejectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to reject quote"),
      );
    }
  },
);

export const cancelQuote = createAsyncThunk(
  "quotes/cancelQuote",
  async ({ quoteId, cancelData }, { rejectWithValue }) => {
    try {
      const response = await quoteService.cancelQuote(quoteId, cancelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to cancel quote"),
      );
    }
  },
);

export const startService = createAsyncThunk(
  "quotes/startService",
  async ({ quoteId, serviceData }, { rejectWithValue }) => {
    try {
      const response = await quoteService.startService(quoteId, serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to start service"),
      );
    }
  },
);

export const completeService = createAsyncThunk(
  "quotes/completeService",
  async ({ quoteId, completionData }, { rejectWithValue }) => {
    try {
      const response = await quoteService.completeService(
        quoteId,
        completionData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to complete service"),
      );
    }
  },
);

// -------------------------------------------
// Slice
// -------------------------------------------

const quoteSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentQuote: (state) => {
      state.currentQuote = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetQuoteState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create quote request
      .addCase(createQuoteRequest.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createQuoteRequest.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns quote directly
        const quote = action.payload.quote || action.payload;
        state.buyerQuotes.unshift(quote);
      })
      .addCase(createQuoteRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Fetch buyer quotes
      .addCase(fetchBuyerQuotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuyerQuotes.fulfilled, (state, action) => {
        state.isLoading = false;
        // Server spreads data directly: { quotes, total, page, limit, totalPages }
        state.buyerQuotes = action.payload.quotes || [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          totalQuotes: action.payload.total || 0,
          limit: action.payload.limit || 20,
          hasNextPage: action.payload.page < action.payload.totalPages,
          hasPrevPage: action.payload.page > 1,
        };
      })
      .addCase(fetchBuyerQuotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch seller quotes
      .addCase(fetchSellerQuotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerQuotes.fulfilled, (state, action) => {
        state.isLoading = false;
        // Server spreads data directly: { quotes, total, page, limit, totalPages, stats }
        state.sellerQuotes = action.payload.quotes || [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          totalQuotes: action.payload.total || 0,
          limit: action.payload.limit || 20,
          hasNextPage: action.payload.page < action.payload.totalPages,
          hasPrevPage: action.payload.page > 1,
        };
      })
      .addCase(fetchSellerQuotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch single quote
      .addCase(fetchQuoteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Server returns { quote, perspective }
        state.currentQuote = action.payload.quote || action.payload;
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Provide quote (seller)
      .addCase(provideQuote.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(provideQuote.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns quote directly
        const updatedQuote = action.payload.quote || action.payload;
        const index = state.sellerQuotes.findIndex(
          (q) => q._id === updatedQuote._id,
        );
        if (index !== -1) {
          state.sellerQuotes[index] = updatedQuote;
        }
        if (state.currentQuote?._id === updatedQuote._id) {
          state.currentQuote = updatedQuote;
        }
      })
      .addCase(provideQuote.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Accept quote (buyer)
      .addCase(acceptQuote.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(acceptQuote.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns quote directly
        const updatedQuote = action.payload.quote || action.payload;
        const index = state.buyerQuotes.findIndex(
          (q) => q._id === updatedQuote._id,
        );
        if (index !== -1) {
          state.buyerQuotes[index] = updatedQuote;
        }
        if (state.currentQuote?._id === updatedQuote._id) {
          state.currentQuote = updatedQuote;
        }
      })
      .addCase(acceptQuote.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Reject quote (buyer)
      .addCase(rejectQuote.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(rejectQuote.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns quote directly
        const updatedQuote = action.payload.quote || action.payload;
        const index = state.buyerQuotes.findIndex(
          (q) => q._id === updatedQuote._id,
        );
        if (index !== -1) {
          state.buyerQuotes[index] = updatedQuote;
        }
        if (state.currentQuote?._id === updatedQuote._id) {
          state.currentQuote = updatedQuote;
        }
      })
      .addCase(rejectQuote.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Cancel quote
      .addCase(cancelQuote.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(cancelQuote.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns quote directly
        const updatedQuote = action.payload.quote || action.payload;
        // Update in both lists
        const buyerIndex = state.buyerQuotes.findIndex(
          (q) => q._id === updatedQuote._id,
        );
        if (buyerIndex !== -1) {
          state.buyerQuotes[buyerIndex] = updatedQuote;
        }
        const sellerIndex = state.sellerQuotes.findIndex(
          (q) => q._id === updatedQuote._id,
        );
        if (sellerIndex !== -1) {
          state.sellerQuotes[sellerIndex] = updatedQuote;
        }
        if (state.currentQuote?._id === updatedQuote._id) {
          state.currentQuote = updatedQuote;
        }
      })
      .addCase(cancelQuote.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Start service (seller)
      .addCase(startService.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(startService.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns quote directly
        const updatedQuote = action.payload.quote || action.payload;
        const index = state.sellerQuotes.findIndex(
          (q) => q._id === updatedQuote._id,
        );
        if (index !== -1) {
          state.sellerQuotes[index] = updatedQuote;
        }
        if (state.currentQuote?._id === updatedQuote._id) {
          state.currentQuote = updatedQuote;
        }
      })
      .addCase(startService.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Complete service (seller)
      .addCase(completeService.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(completeService.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Server returns quote directly
        const updatedQuote = action.payload.quote || action.payload;
        const index = state.sellerQuotes.findIndex(
          (q) => q._id === updatedQuote._id,
        );
        if (index !== -1) {
          state.sellerQuotes[index] = updatedQuote;
        }
        if (state.currentQuote?._id === updatedQuote._id) {
          state.currentQuote = updatedQuote;
        }
      })
      .addCase(completeService.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearCurrentQuote,
  clearError,
  resetQuoteState,
} = quoteSlice.actions;

export default quoteSlice.reducer;
