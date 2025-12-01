import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "../service/orderService";

const initialState = {
  // Orders lists
  myOrders: [], // Buyer or seller orders from /my-orders
  sellerOrders: [], // Seller dashboard orders

  // Single order detail
  currentOrder: null,

  // Pagination & totals
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Filters (for UI persistence)
  filters: {
    role: "buyer", // 'buyer' or 'seller'
    status: null,
    paymentStatus: null,
    deliveryStatus: null,
    startDate: null,
    endDate: null,
    sort: "-createdAt", // default to newest first
  },

  // Analytics data
  analytics: null,

  // Simple loading and error states
  isLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message ||
          "An error occurred while creating the order."
      );
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getMyOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message ||
          "An error occurred while fetching orders."
      );
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  "orders/fetchSellerOrders",
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getSellerOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message ||
          "An error occurred while fetching seller orders."
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async ({ orderId, params }, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message ||
          "An error occurred while fetching the order."
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status, notes }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message ||
          "An error occurred while updating the order status."
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason, description }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId, {
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message ||
          "An error occurred while cancelling the order."
      );
    }
  }
);

export const fetchOrderAnalytics = createAsyncThunk(
  "orders/fetchOrderAnalytics",
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message ||
          "An error occurred while fetching order analytics."
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Set filters (for controlled filter UI)
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear single order (when leaving detail page)
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update single order in list (after status change)
    updateOrderInList: (state, action) => {
      const updatedOrder = action.payload;
      const updateInArray = (orders) => {
        const index = orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          orders[index] = updatedOrder;
        }
      };

      updateInArray(state.myOrders);
      updateInArray(state.sellerOrders);

      // Also update currentOrder if it's the same
      if (state.currentOrder?._id === updatedOrder._id) {
        state.currentOrder = updatedOrder;
      }
    },
  },

  extraReducers: (builder) => {
    // CREATE ORDER
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const newOrder = action.payload.data || action.payload;
        state.myOrders.unshift(newOrder);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // FETCH MY ORDERS
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload.orders || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // FETCH SELLER ORDERS
    builder
      .addCase(fetchSellerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellerOrders = action.payload.orders || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // FETCH ORDER BY ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.data || action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // UPDATE ORDER STATUS
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload.data || action.payload;

        // Update in both arrays
        const updateInArray = (orders) => {
          const index = orders.findIndex((o) => o._id === updatedOrder._id);
          if (index !== -1) {
            orders[index] = updatedOrder;
          }
        };
        updateInArray(state.myOrders);
        updateInArray(state.sellerOrders);

        // Update currentOrder if it matches
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // CANCEL ORDER
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const cancelResult = action.payload.data || action.payload;

        // Update in both arrays (find by orderId)
        const updateInArray = (orders) => {
          const index = orders.findIndex((o) => o._id === cancelResult.orderId);
          if (index !== -1) {
            orders[index].status = "cancelled";
            orders[index].cancelledAt = cancelResult.cancelledAt;
          }
        };
        updateInArray(state.myOrders);
        updateInArray(state.sellerOrders);

        // Update currentOrder if it matches
        if (state.currentOrder?._id === cancelResult.orderId) {
          state.currentOrder.status = "cancelled";
          state.currentOrder.cancelledAt = cancelResult.cancelledAt;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // FETCH ORDER ANALYTICS
    builder
      .addCase(fetchOrderAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload.data || action.payload;
      })
      .addCase(fetchOrderAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearCurrentOrder,
  clearError,
  updateOrderInList,
} = orderSlice.actions;

export default orderSlice.reducer;
