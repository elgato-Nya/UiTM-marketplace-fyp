import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import profileService from "../service/profileService";

const initialState = {
  user: null,
  roles: [],
  isLoading: false,
  error: null,
  success: null,
};

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();

      return {
        user: response.data,
        roles: response.data.roles,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to fetch profile",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileData);

      return {
        user: response.data,
        roles: response.data.roles,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to update profile",
        statusCode: error.response?.status || 500,
        validationErrors: error.response?.data?.errors || null,
        details: error.response?.data || null,
      });
    }
  }
);

export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async (passwords, { rejectWithValue }) => {
    try {
      const response = await profileService.changePassword(passwords);
      return {
        message: response.data.message || "Password changed successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to change password",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
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
    clearProfile: (state) => {
      // Clear all profile data (used on logout)
      state.user = null;
      state.roles = [];
      state.isLoading = false;
      state.error = null;
      state.success = null;
    },
    updateUserRoles: (state, action) => {
      state.roles = action.payload.roles;
      if (state.user) {
        state.user.roles = action.payload.roles;
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.success = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        console.log("User profile fetched successfully:", action.payload);
        state.isLoading = false;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        console.log("User profile updated successfully:", action.payload);
        state.isLoading = false;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.error = null;
        state.success = { message: "Profile updated successfully" };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = null;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearMessages,
  clearProfile,
  updateUserRoles,
  updateUser,
} = profileSlice.actions;
export const selectProfile = (state) => state.profile;
export const selectProfileLoading = (state) => state.profile.isLoading;
export const selectProfileError = (state) => state.profile.error;
export const selectUserProfileData = (state) => state.profile.user;
export const selectUserRoles = (state) => state.profile.roles;
export const selectProfileSuccess = (state) => state.profile.success;

export default profileSlice.reducer;
