import api from "../../../services/api";

const listingService = {
  async createListing(listingData) {
    return await api.post("/listings", listingData);
  },

  async getAllListings(params = {}) {
    return await api.get("/listings", { params });
  },

  async getListingById(listingId) {
    return await api.get(`/listings/${listingId}`, {
      params: { includeSeller: "true" }, // Explicitly use string for backend
    });
  },

  async getSellerListings(sellerId, params = {}) {
    return await api.get(`/listings/seller/${sellerId}`, { params });
  },

  async getMyListings(params = {}) {
    return await api.get("/listings/my-listings", { params });
  },

  async updateListing(listingId, updates) {
    return await api.patch(`/listings/${listingId}`, updates);
  },

  async deleteListing(listingId, isPermanent = false) {
    return api.delete(`/listings/${listingId}`, {
      params: { permanent: isPermanent },
    });
  },

  async toggleAvailability(listingId) {
    return await api.patch(`/listings/toggle-availability/${listingId}`);
  },

  // todo: do this function properly into its own file
  // Helper: Upload images to S3
  async uploadImages(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    return api.post("/listings/upload-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ========== VARIANT METHODS ==========

  /**
   * Get all variants for a listing
   * @param {string} listingId - Listing ID
   * @returns {Promise} - Variants array
   */
  async getVariants(listingId) {
    return await api.get(`/listings/${listingId}/variants`);
  },

  /**
   * Get a specific variant by ID
   * @param {string} listingId - Listing ID
   * @param {string} variantId - Variant ID
   * @returns {Promise} - Variant object
   */
  async getVariant(listingId, variantId) {
    return await api.get(`/listings/${listingId}/variants/${variantId}`);
  },

  /**
   * Add a new variant to a listing
   * @param {string} listingId - Listing ID
   * @param {object} variantData - Variant data (name, price, stock, sku, attributes, images)
   * @returns {Promise} - Updated listing with new variant
   */
  async addVariant(listingId, variantData) {
    return await api.post(`/listings/${listingId}/variants`, variantData);
  },

  /**
   * Update an existing variant
   * @param {string} listingId - Listing ID
   * @param {string} variantId - Variant ID
   * @param {object} updates - Variant updates
   * @returns {Promise} - Updated listing
   */
  async updateVariant(listingId, variantId, updates) {
    return await api.put(
      `/listings/${listingId}/variants/${variantId}`,
      updates
    );
  },

  /**
   * Remove a variant from a listing
   * @param {string} listingId - Listing ID
   * @param {string} variantId - Variant ID
   * @returns {Promise} - Updated listing
   */
  async removeVariant(listingId, variantId) {
    return await api.delete(`/listings/${listingId}/variants/${variantId}`);
  },

  /**
   * Alias for removeVariant
   */
  async deleteVariant(listingId, variantId) {
    return this.removeVariant(listingId, variantId);
  },
};

export default listingService;
