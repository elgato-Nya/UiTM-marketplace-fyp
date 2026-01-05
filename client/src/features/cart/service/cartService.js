import api from "../../../services/api";

const cartService = {
  async getCart() {
    return await api.get("/cart");
  },

  /**
   * Add item to cart
   * @param {string} listingId - Listing ID
   * @param {number} quantity - Quantity to add (default 1)
   * @param {string|null} variantId - Optional variant ID for variant items
   * @returns {Promise} - Updated cart
   */
  async addToCart(listingId, quantity = 1, variantId = null) {
    const payload = { listingId, quantity };
    if (variantId) {
      payload.variantId = variantId;
    }
    return await api.post("/cart", payload);
  },

  /**
   * Update cart item quantity
   * @param {string} listingId - Listing ID
   * @param {number} quantity - New quantity
   * @param {string|null} variantId - Optional variant ID for variant items
   * @returns {Promise} - Updated cart
   */
  async updateCartItem(listingId, quantity, variantId = null) {
    if (variantId) {
      return await api.patch(`/cart/item/${listingId}/variant/${variantId}`, {
        quantity,
      });
    }
    return await api.patch(`/cart/item/${listingId}`, { quantity });
  },

  /**
   * Remove item from cart
   * @param {string} listingId - Listing ID
   * @param {string|null} variantId - Optional variant ID for variant items
   * @returns {Promise} - Updated cart
   */
  async removeFromCart(listingId, variantId = null) {
    if (variantId) {
      return await api.delete(`/cart/item/${listingId}/variant/${variantId}`);
    }
    return await api.delete(`/cart/item/${listingId}`);
  },

  async clearCart() {
    return await api.delete("/cart");
  },

  async moveToWishlist(listingId) {
    return await api.post(`/cart/move-to-wishlist/${listingId}`);
  },
};

export default cartService;
