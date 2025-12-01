import api from "../api";

export const restoreSession = async (dispatch) => {
  try {
    // Direct call to refresh endpoint - more efficient (1 API call vs 2)
    const response = await api.post("/auth/refresh-token");

    if (response.data.success && response.data.token) {
      // The server spreads user data directly into response.data
      const { token, email, roles, profile } = response.data;
      const user = { email, profile };

      console.log("sessionRestorer: Session restored successfully:", {
        userEmail: email,
        hasToken: !!token,
        roles: roles,
      });

      dispatch({
        type: "auth/restoreSession",
        payload: {
          user,
          token,
          roles: roles || ["consumer"],
          isAuthenticated: true,
        },
      });

      return true;
    }
  } catch (error) {
    console.log(
      "sessionRestorer: No valid session found:",
      error.response?.status || error.message
    );
    return false;
  }

  return false;
};

export default restoreSession;
