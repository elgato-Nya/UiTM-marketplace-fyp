import api from "../../../services/api";

const wishlistService = {
  /**
   * Get user's wishlist with full details
   * @returns {Promise} Wishlist data
   */
  async getWishlist() {
    return await api.get("/wishlist");
  },

  /**
   * Add item to wishlist
   * @param {string} listingId - Listing ID to add
   * @returns {Promise} Updated wishlist
   */
  async addToWishlist(listingId) {
    return await api.post("/wishlist/add", { listingId });
  },

  /**
   * Remove item from wishlist
   * @param {string} listingId - Listing ID to remove
   * @returns {Promise} Updated wishlist
   */
  async removeFromWishlist(listingId) {
    return await api.delete(`/wishlist/item/${listingId}`);
  },

  /**
   * Clear entire wishlist
   * @returns {Promise} Empty wishlist
   */
  async clearWishlist() {
    return await api.delete("/wishlist");
  },

  /**
   * Move item from wishlist to cart
   * @param {string} listingId - Listing ID to move
   * @returns {Promise} Updated wishlist
   */
  async moveToCart(listingId, quantity) {
    return await api.post(`/wishlist/move-to-cart/${listingId}`, { quantity });
  },
};

export default wishlistService;
