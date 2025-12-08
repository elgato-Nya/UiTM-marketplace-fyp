import api from "../api";

export const restoreSession = async (dispatch) => {
  try {
    // Direct call to refresh endpoint - more efficient (1 API call vs 2)
    const response = await api.post("/auth/refresh-token");

    if (response.data.success && response.data.token) {
      // The server spreads user data directly into response.data
      const { token, email, roles, profile } = response.data;
      const user = { email, profile };

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
    return false;
  }

  return false;
};

export default restoreSession;
