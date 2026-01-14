import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import analyticsService from "../service/analyticsService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";

/**
 * Analytics Redux Slice
 *
 * PURPOSE: Manage analytics state globally
 * PATTERN: Matches orderSlice.js architecture
 *
 * IMPORTANT: Server spreads data directly into response
 * We extract the analytics data from response.data (the whole object except success/message/timestamp)
 */

const initialState = {
  // Merchant Analytics by Period
  currentPeriod: "week",
  weekAnalytics: null,
  monthAnalytics: null,
  yearAnalytics: null,

  // Overview (all periods)
  overview: null,

  // Quick stats
  quickStats: null,

  // Filters
  filters: {
    period: "week",
    refreshedAt: null,
  },

  // UI State
  isLoading: false,
  isRefreshing: false,
  error: null,
};

/**
 * Fetch merchant analytics by period
 */
export const fetchMerchantAnalytics = createAsyncThunk(
  "analytics/fetchMerchantAnalytics",
  async (period, { rejectWithValue }) => {
    try {
      const response =
        await analyticsService.getMerchantAnalyticsByPeriod(period);
      // Server spreads data directly, so response.data contains all analytics fields
      return { period, data: response.data };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load your analytics data.")
      );
    }
  }
);

/**
 * Fetch merchant overview (all periods)
 */
export const fetchMerchantOverview = createAsyncThunk(
  "analytics/fetchMerchantOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getMerchantOverview();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load analytics overview.")
      );
    }
  }
);

/**
 * Fetch quick stats
 */
export const fetchQuickStats = createAsyncThunk(
  "analytics/fetchQuickStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getMerchantQuickStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load quick statistics.")
      );
    }
  }
);

/**
 * Refresh analytics manually
 */
export const refreshMerchantAnalytics = createAsyncThunk(
  "analytics/refreshMerchantAnalytics",
  async (period, { rejectWithValue }) => {
    try {
      const response = await analyticsService.refreshMerchantAnalytics(period);
      return { period, data: response.data };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to refresh analytics data.")
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    // Set current viewing period
    setCurrentPeriod: (state, action) => {
      state.currentPeriod = action.payload;
    },

    // Update filters
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset analytics state
    resetAnalytics: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Merchant Analytics by Period
      .addCase(fetchMerchantAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMerchantAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        const { period, data } = action.payload;

        // Remove metadata fields
        const { success, message, timestamp, ...analyticsData } = data;

        // Store in appropriate period slot
        if (period === "week") {
          state.weekAnalytics = analyticsData;
        } else if (period === "month") {
          state.monthAnalytics = analyticsData;
        } else if (period === "year") {
          state.yearAnalytics = analyticsData;
        }
      })
      .addCase(fetchMerchantAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Merchant Overview
      .addCase(fetchMerchantOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMerchantOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        const { success, message, timestamp, week, month, year, ...rest } =
          action.payload;

        // Store overview
        state.overview = { week, month, year };

        // Also populate individual period states
        if (week) state.weekAnalytics = week;
        if (month) state.monthAnalytics = month;
        if (year) state.yearAnalytics = year;
      })
      .addCase(fetchMerchantOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Quick Stats
      .addCase(fetchQuickStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuickStats.fulfilled, (state, action) => {
        state.isLoading = false;
        const { success, message, timestamp, ...stats } = action.payload;
        state.quickStats = stats;
      })
      .addCase(fetchQuickStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Refresh Analytics
      .addCase(refreshMerchantAnalytics.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshMerchantAnalytics.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.filters.refreshedAt = new Date().toISOString();

        const { period, data } = action.payload;
        const { success, message, timestamp, ...analyticsData } = data;

        // Handle "all" period - data contains { week, month, year }
        if (period === "all") {
          if (analyticsData.week) state.weekAnalytics = analyticsData.week;
          if (analyticsData.month) state.monthAnalytics = analyticsData.month;
          if (analyticsData.year) state.yearAnalytics = analyticsData.year;
        } else {
          // Single period refresh - data is the analytics object directly
          if (period === "week") {
            state.weekAnalytics = analyticsData;
          } else if (period === "month") {
            state.monthAnalytics = analyticsData;
          } else if (period === "year") {
            state.yearAnalytics = analyticsData;
          }
        }
      })
      .addCase(refreshMerchantAnalytics.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPeriod,
  setFilters,
  clearFilters,
  clearError,
  resetAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
