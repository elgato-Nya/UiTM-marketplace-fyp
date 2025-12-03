import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import authService from "../service/authService";

// Helper function to safely get from localStorage
const getFromLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get ${key} from localStorage:`, error);
    return null;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  roles: [], // Array of roles: ['consumer', 'merchant', 'admin']
  token: getFromLocalStorage("token"),
  refreshToken: getFromLocalStorage("refreshToken"),
  isLoading: false,
  error: null,
  lastLoginTime: null,
  sessionExpiry: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      // Extract user data from response - the server returns user data in response.data directly
      const { email, roles, profile, token } = response.data;
      const user = { email, profile };

      return {
        user,
        token,
        roles,
        sessionExpiry: response.data.sessionExpiry,
      };
    } catch (error) {
      // Extract the detailed error message from the server response
      const serverError = error.response?.data?.error;
      const errorMessage =
        serverError?.message ||
        error.response?.data?.message ||
        error?.message ||
        "Login failed";

      return rejectWithValue({
        message: errorMessage,
        code: serverError?.code || "UNKNOWN_ERROR",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);

      // Registration just returns a success message, no user data
      return {
        message: response.data.message || "Registration successful",
      };
    } catch (error) {
      // Extract detailed error from server response
      const serverError = error.response?.data?.error;
      const validationErrors = error.response?.data?.errors;

      let errorMessage =
        serverError?.message ||
        error.response?.data?.message ||
        error?.message ||
        "Registration failed";

      // If there are validation errors, format them nicely
      if (validationErrors && validationErrors.length > 0) {
        const fieldErrors = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(", ");
        errorMessage = `Validation failed: ${fieldErrors}`;
      }

      return rejectWithValue({
        message: errorMessage,
        code: serverError?.code || "UNKNOWN_ERROR",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
        validationErrors: validationErrors || null,
      });
    }
  }
);

export const handleRefreshToken = createAsyncThunk(
  "auth/handleRefreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await authService.refreshToken(auth.refreshToken);

      return {
        token: response.data.token,
        sessionExpiry: response.data.sessionExpiry,
      };
    } catch (error) {
      return rejectWithValue({
        message: "Session expired. Please log in again.",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await authService.logout(auth.token);

      return {
        message: "Logged out successfully",
        statusCode: 200,
      };
    } catch (error) {
      return rejectWithValue({
        message: "Logout completed locally",
        statusCode: error.response?.status,
      });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return { message: response.data.message || "Reset email sent" };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error?.message ||
          "Failed to send reset email",
        statusCode: error.response?.status || 500,
        details: error.response?.data || null,
      });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      // Safely clear localStorage
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } catch (error) {
        console.warn("Failed to clear tokens from localStorage:", error);
      }

      // Return clean initial state (without localStorage tokens)
      return {
        user: null,
        isAuthenticated: false,
        roles: [],
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null,
        lastLoginTime: null,
        sessionExpiry: null,
      };
    },
    setTokens: (state, action) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }

      // Safely store tokens in localStorage
      try {
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      } catch (error) {
        console.warn("Failed to store tokens in localStorage:", error);
      }
    },
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload.sessionExpiry;
    },
    restoreSession: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.roles = action.payload.roles;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = false;
      state.error = null;
    },
    setAccessToken: (state, action) => {
      state.token = action.payload.token;
    },
    updateUser: (state, action) => {
      // Update user data in auth state (e.g., after profile update)
      if (action.payload) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiry = action.payload.sessionExpiry;
        state.error = null;

        // Store tokens in localStorage
        try {
          if (action.payload.token) {
            localStorage.setItem("token", action.payload.token);
          }
          if (action.payload.refreshToken) {
            localStorage.setItem("refreshToken", action.payload.refreshToken);
          }
        } catch (error) {
          console.warn("Failed to store login tokens in localStorage:", error);
        }

        console.log("Login successful, tokens stored");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload || { message: "Login failed" };
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        // Registration doesn't authenticate the user - they need to login
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Registration failed" };
      })

      // Handle Refresh Token
      .addCase(handleRefreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(handleRefreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.sessionExpiry = action.payload.sessionExpiry;
        state.error = null;
      })
      .addCase(handleRefreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload || { message: "Session expired" };
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];

        state.token = null;
        state.refreshToken = null;
        state.sessionExpiry = null;
        state.error = null;

        // Clear localStorage
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        } catch (error) {
          console.warn("Failed to clear tokens from localStorage:", error);
        }
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.token = null;
        state.refreshToken = null;
        state.sessionExpiry = null;
        state.error = action.payload || { message: "Logout failed" };

        // Clear localStorage even on error
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        } catch (error) {
          console.warn("Failed to clear tokens from localStorage:", error);
        }
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ?? Upgrade to Merchant
  },
});

export const {
  clearError,
  clearAuth,
  setTokens,
  setSessionExpiry,
  restoreSession,
  setAccessToken,
  updateUser,
} = authSlice.actions;

// Selectors for complex state derivation
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => {
  const { isAuthenticated, token } = state.auth;

  if (!isAuthenticated || !token) {
    return false;
  }

  // Additional validation: check if token is properly formatted
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid token format detected");
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Token validation error:", error);
    return false;
  }
};
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRoles = (state) => state.auth.roles;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Role-based selectors
export const selectIsConsumer = (state) =>
  state.auth.roles.includes("consumer");
export const selectIsMerchant = (state) =>
  state.auth.roles.includes("merchant");
export const selectIsAdmin = (state) => state.auth.roles.includes("admin");
export const selectCanSell = (state) =>
  state.auth.roles.includes("merchant") || state.auth.roles.includes("admin");
export const selectCanAccessAdmin = (state) =>
  state.auth.roles.includes("admin");

export default authSlice.reducer;
