import api from "../../../services/api/index";

/**
 * Merchant Service
 *
 * PURPOSE: Handle all merchant/shop-related API calls
 * ENDPOINTS: /api/merchants/*
 */

const merchantService = {
  /**
   * Get current user's merchant profile (auto-creates if doesn't exist)
   * @returns {Promise} Shop data with isNew flag
   */
  async getMyShop() {
    try {
      const response = await api.get("/merchants/profile");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update merchant shop details
   * @param {Object} shopData - Shop information to update
   * @returns {Promise} Updated shop data
   */
  async updateShop(shopData) {
    try {
      const response = await api.put("/merchants/profile", shopData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get shop by slug (public)
   * @param {string} shopSlug - Shop slug identifier
   * @returns {Promise} Shop data with merchant info
   */
  async getShopBySlug(shopSlug) {
    try {
      const response = await api.get(`/merchants/shop/${shopSlug}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get shop statistics
   * @returns {Promise} Shop metrics and stats
   */
  async getShopStats() {
    try {
      const response = await api.get("/merchants/stats");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search merchants (public)
   * @param {Object} params - Search parameters (q, minRating, page, limit)
   * @returns {Promise} Paginated merchant results
   */
  async searchMerchants(params = {}) {
    try {
      const response = await api.get("/merchants/search", { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Track shop view (public)
   * @param {string} shopSlug - Shop slug identifier
   * @returns {Promise} Updated view count
   */
  async trackShopView(shopSlug) {
    try {
      const response = await api.post(`/merchants/shop/${shopSlug}/view`);
      return response;
    } catch (error) {
      // Silently fail - view tracking shouldn't break the page
      console.warn("Failed to track shop view:", error);
      return null;
    }
  },

  /**
   * Sync merchant data to all listings (manual trigger)
   * Updates username, shopName, shopSlug in all listing documents
   * @returns {Promise} Sync result with updated count
   */
  async syncListings() {
    try {
      const response = await api.post("/merchants/sync-listings");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default merchantService;
