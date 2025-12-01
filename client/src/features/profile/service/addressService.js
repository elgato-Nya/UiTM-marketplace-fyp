import api from "../../../services/api/index";

const addressService = {
  async getAddresses(type = "campus") {
    const response = await api.get(`/addresses?type=${type}`);
    return response.data;
  },

  async createAddress(addressData) {
    const response = await api.post("/addresses", addressData);
    return response.data;
  },

  async updateAddress(addressId, addressData) {
    const response = await api.patch(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  async deleteAddress(addressId) {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },

  async setDefaultAddress(addressId, type) {
    const response = await api.patch(`/addresses/${addressId}/default`, {
      type,
    });
    return response;
  },

  async getDefaultAddress() {
    const response = await api.get("/addresses/default");
    return response.data;
  },
};

export default addressService;
