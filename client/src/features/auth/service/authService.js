import api from "../../../services/api/index";

// todo: check the return value is it really that simple and check whether this file is really relevant
const authService = {
  // auth related API calls
  async login(credentials) {
    return await api.post("/auth/login", credentials);
  },

  async register(userData) {
    return await api.post("/auth/register", userData);
  },

  async refreshToken(refreshToken) {
    return await api.post("/auth/refresh-token", { refreshToken });
  },

  async logout() {
    return await api.post("/auth/logout");
  },

  async forgotPassword(email) {
    return await api.post("/auth/forgot-password", { email });
  },

  async resendForgotPasswordCode(email) {
    return await api.post("/auth/resend-forgot-password-code", { email });
  },

  // email verification API calls
  async verifyEmail(code) {
    return await api.post("/auth/verify-email", { code });
  },

  async resendVerificationEmail() {
    return await api.post("/auth/resend-verification-email");
  },
};

export default authService;
