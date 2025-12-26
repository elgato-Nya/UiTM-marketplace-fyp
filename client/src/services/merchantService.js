import api from "./api";

/**
 * Merchant Service
 *
 * PURPOSE: Handle merchant-related API calls
 * SCOPE: Shop search, merchant details, shop metrics
 */

/**
 * Search merchants/shops (public)
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query
 * @param {string} params.category - Category filter
 * @param {number} params.minRating - Minimum rating filter
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Search results with merchants and pagination
 */
export const searchMerchants = async (params = {}) => {
  try {
    const response = await api.get("/merchants/search", { params });
    return response.data;
  } catch (error) {
    console.error("Error searching merchants:", error);
    throw error;
  }
};

/**
 * Get merchant details by shop slug (public)
 * @param {string} shopSlug - Shop slug
 * @returns {Promise<Object>} Merchant and shop details
 */
export const getMerchantBySlug = async (shopSlug) => {
  try {
    const response = await api.get(`/merchants/shop/${shopSlug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching merchant details:", error);
    throw error;
  }
};

/**
 * Track shop view (increment view counter)
 * @param {string} shopSlug - Shop slug
 * @returns {Promise<Object>} Updated view count
 */
export const trackShopView = async (shopSlug) => {
  try {
    const response = await api.post(`/merchants/shop/${shopSlug}/view`);
    return response.data;
  } catch (error) {
    console.error("Error tracking shop view:", error);
    throw error;
  }
};

/**
 * Get authenticated merchant profile
 * @returns {Promise<Object>} Merchant profile with shop details
 */
export const getMerchantProfile = async () => {
  try {
    const response = await api.get("/merchants/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching merchant profile:", error);
    throw error;
  }
};

/**
 * Create or update merchant profile
 * @param {Object} merchantData - Merchant data to create/update
 * @returns {Promise<Object>} Updated merchant profile
 */
export const createOrUpdateMerchant = async (merchantData) => {
  try {
    const response = await api.put("/merchants/profile", merchantData);
    return response.data;
  } catch (error) {
    console.error("Error updating merchant profile:", error);
    throw error;
  }
};

/**
 * Get merchant stats (authenticated)
 * @returns {Promise<Object>} Merchant statistics
 */
export const getMerchantStats = async () => {
  try {
    const response = await api.get("/merchants/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching merchant stats:", error);
    throw error;
  }
};

/**
 * Get merchant's delivery fee settings (authenticated)
 * @returns {Promise<Object>} Delivery fee settings
 */
export const getDeliverySettings = async () => {
  try {
    const response = await api.get("/merchants/settings/delivery");
    return response.data;
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
    throw error;
  }
};

/**
 * Update merchant's delivery fee settings (authenticated)
 * @param {Object} settings - Delivery fee settings
 * @param {number} settings.personalDeliveryFee - Personal delivery fee (0-100)
 * @param {number} settings.campusDeliveryFee - Campus delivery fee (0-100)
 * @param {number} settings.pickupFee - Pickup fee (0-100)
 * @param {number} settings.freeDeliveryThreshold - Free delivery threshold (>= 0)
 * @param {Array<string>} settings.deliverableCampuses - Deliverable campus keys
 * @returns {Promise<Object>} Updated delivery fee settings
 */
export const updateDeliverySettings = async (settings) => {
  try {
    const response = await api.put("/merchants/settings/delivery", settings);
    return response.data;
  } catch (error) {
    console.error("Error updating delivery settings:", error);
    throw error;
  }
};

/**
 * Get delivery fees for a specific listing (public)
 * @param {string} listingId - Listing ID
 * @returns {Promise<Object>} Delivery fee information for listing
 */
export const getListingDeliveryFees = async (listingId) => {
  try {
    const response = await api.get(`/listings/${listingId}/delivery-fees`);
    return response.data;
  } catch (error) {
    console.error("Error fetching listing delivery fees:", error);
    throw error;
  }
};

export default {
  searchMerchants,
  getMerchantBySlug,
  trackShopView,
  getMerchantProfile,
  createOrUpdateMerchant,
  getMerchantStats,
  getDeliverySettings,
  updateDeliverySettings,
  getListingDeliveryFees,
};
