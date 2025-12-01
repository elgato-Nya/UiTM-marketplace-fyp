import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import addressService from "../service/addressService";

const initialState = {
  addresses: [],
  currentType: "campus",
  isLoading: false,
  error: null,
  success: null,
};

export const fetchAddresses = createAsyncThunk(
  "addresses/fetchAddresses",
  async (type = "campus", { rejectWithValue }) => {
    try {
      const response = await addressService.getAddresses(type);

      // Handle structured response format
      // Backend returns { success: true, data: addresses[], message: "..." }
      let addresses = response.data?.data || response.data || response || [];

      return {
        addresses: Array.isArray(addresses) ? addresses : [],
        type,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to fetch addresses",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

export const createAddress = createAsyncThunk(
  "addresses/createAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await addressService.createAddress(addressData);
      // Backend returns { success: true, data: newAddress, message: "..." }
      return response.data?.data || response.data || response;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to create address",
      });
    }
  }
);

export const updateAddress = createAsyncThunk(
  "addresses/updateAddress",
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await addressService.updateAddress(
        addressId,
        addressData
      );
      // Backend returns { success: true, data: updatedAddress, message: "..." }
      return response.data?.data || response.data || response;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to update address",
      });
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "addresses/deleteAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await addressService.deleteAddress(addressId);
      // Backend returns { success: true, data: { _id: addressId, deleted: true }, message: "..." }
      const responseData = response.data?.data || response.data || response;
      return { _id: addressId, ...responseData };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to delete address",
      });
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "addresses/setDefaultAddress",
  async ({ addressId, type }, { rejectWithValue }) => {
    try {
      const response = await addressService.setDefaultAddress(addressId, type);
      // todo: try to find a better way to handle this
      // Backend returns { success: true, data: { addressId, type, success: true }, message: "..." }
      const responseData = response.data?.data || response.data || response;
      return {
        addressId,
        type,
        data: responseData,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to set default address",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

export const getDefaultAddress = createAsyncThunk(
  "addresses/getDefaultAddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getDefaultAddress();
      // Backend returns { success: true, data: defaultAddress, message: "..." }
      return response.data?.data || response.data || response;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to get default address",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

const addressSlice = createSlice({
  name: "addresses",
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
    setCurrentType: (state, action) => {
      state.currentType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.success = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        const { addresses, type } = action.payload;
        // Ensure state.addresses is always an array
        if (!Array.isArray(state.addresses)) {
          state.addresses = [];
        }
        // Ensure addresses from API is an array
        const newAddresses = Array.isArray(addresses) ? addresses : [];

        // Only update if we actually got different data to prevent unnecessary re-renders
        const existingAddressesOfType = state.addresses.filter(
          (addr) => addr.type === type
        );
        const hasChanges =
          existingAddressesOfType.length !== newAddresses.length ||
          !existingAddressesOfType.every(
            (existing, index) => existing._id === newAddresses[index]?._id
          );

        if (hasChanges) {
          // Replace addresses of the same type while keeping others, preventing duplicates
          state.addresses = [
            ...state.addresses.filter((addr) => addr.type !== type),
            ...newAddresses,
          ];
        }

        state.currentType = type;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to fetch addresses",
        };
      })

      // Create Address
      .addCase(createAddress.pending, (state) => {
        state.isLoading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure state.addresses is always an array
        if (!Array.isArray(state.addresses)) {
          state.addresses = [];
        }
        // action.payload should now be the new address object
        const newAddress = action.payload;
        if (newAddress && newAddress._id) {
          state.addresses.push(newAddress);
        }
        state.error = null;
        state.success = "Address created successfully";
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to create address",
        };
      })

      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure state.addresses is always an array
        if (!Array.isArray(state.addresses)) {
          state.addresses = [];
        }
        // action.payload should now be the updated address object
        const updatedAddress = action.payload;
        if (updatedAddress && updatedAddress._id) {
          const index = state.addresses.findIndex(
            (addr) => addr._id === updatedAddress._id
          );
          if (index !== -1) {
            state.addresses[index] = updatedAddress;
          }
        }
        state.error = null;
        state.success = "Address updated successfully";
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to update address",
        };
      })

      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure state.addresses is always an array
        if (!Array.isArray(state.addresses)) {
          state.addresses = [];
        }
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload._id
        );
        state.error = null;
        state.success = "Address deleted successfully";
        // Note: The backend may have auto-set a new default address
        // The UI will refetch addresses to get the updated default status
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to delete address",
        };
      })

      // Set Default Address
      .addCase(setDefaultAddress.pending, (state) => {
        state.isLoading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract the payload data - could be nested in response.data
        const responseData = action.payload?.data || action.payload;
        const { addressId, type } = responseData || {};

        // Ensure state.addresses is always an array
        if (!Array.isArray(state.addresses)) {
          state.addresses = [];
        }

        // Remove default from all addresses of the same type and set the new default
        if (addressId && type) {
          state.addresses = state.addresses.map((addr) =>
            addr.type === type
              ? { ...addr, isDefault: addr._id === addressId }
              : addr
          );
        }

        state.error = null;
        state.success = "Default address set successfully";
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to set default address",
        };
      })

      // Get Default Address
      .addCase(getDefaultAddress.pending, (state) => {
        state.isLoading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(getDefaultAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.defaultAddress = action.payload;
        state.error = null;
        state.success = "Default address fetched successfully";
      })
      .addCase(getDefaultAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          message: "Failed to get default address",
        };
      });
  },
});

export const { clearError, clearSuccess, clearMessages, setCurrentType } =
  addressSlice.actions;

// Selector
export const selectAddresses = (state) => state.addresses;
export const selectAddressesByType = (type) => (state) => {
  const addresses = state.addresses?.addresses;
  return Array.isArray(addresses)
    ? addresses.filter((addr) => addr.type === type)
    : [];
};
export const selectDefaultAddress = (type) => (state) => {
  const addresses = state.addresses?.addresses;
  return Array.isArray(addresses)
    ? addresses.find((addr) => addr.type === type && addr.isDefault)
    : null;
};
export const selectAddressesLoading = (state) => state.addresses.isLoading;
export const selectAddressesError = (state) => state.addresses.error;
export const selectAddressesSuccess = (state) => state.addresses.success;

export default addressSlice.reducer;
