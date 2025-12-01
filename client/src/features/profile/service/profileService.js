import api from "../../../services/api/index";

const profileService = {
  async getProfile() {
    try {
      const response = await api.get("/users/me");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.patch("/users/me", profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async changePassword(passwords) {
    // TODO: Implement password change endpoint on server
    throw new Error("Password change functionality is not yet implemented");
    // const response = await api.post("/auth/change-password", passwords);
    // return response;
  },
};

export default profileService;
