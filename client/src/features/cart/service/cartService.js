import api from "../../../services/api";

const cartService = {
  async getCart() {
    return await api.get("/cart");
  },

  async addToCart(listingId, quantity = 1) {
    return await api.post("/cart", { listingId, quantity });
  },

  async updateCartItem(listingId, quantity) {
    return await api.patch(`/cart/item/${listingId}`, { quantity });
  },

  async removeFromCart(listingId) {
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
