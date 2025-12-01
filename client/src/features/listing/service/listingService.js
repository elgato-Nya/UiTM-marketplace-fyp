import api from "../../../services/api";

const listingService = {
  async createListing(listingData) {
    return await api.post("/listings", listingData);
  },

  async getAllListings(params = {}) {
    return await api.get("/listings", { params });
  },

  async getListingById(listingId) {
    return await api.get(`/listings/${listingId}`);
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
};

export default listingService;
