import api from "../../../services/api";

/**
 * Quote Service - API communication layer
 *
 * PURPOSE: Centralize all quote-related API calls
 * PATTERN: Returns Axios responses directly
 */

const quoteService = {
  // -------------------------------------------
  // Buyer endpoints
  // -------------------------------------------

  async createQuoteRequest(quoteData) {
    return api.post("/quotes", quoteData);
  },

  async getMyQuotes(params = {}) {
    return api.get("/quotes/my-quotes", { params });
  },

  async acceptQuote(quoteId, acceptData) {
    return api.patch(`/quotes/${quoteId}/accept`, acceptData);
  },

  async rejectQuote(quoteId, rejectData) {
    return api.patch(`/quotes/${quoteId}/reject`, rejectData);
  },

  async cancelQuote(quoteId, cancelData) {
    return api.patch(`/quotes/${quoteId}/cancel`, cancelData);
  },

  // -------------------------------------------
  // Seller endpoints
  // -------------------------------------------

  async getSellerQuotes(params = {}) {
    return api.get("/quotes/seller", { params });
  },

  async provideQuote(quoteId, quoteData) {
    return api.patch(`/quotes/${quoteId}/respond`, quoteData);
  },

  async startService(quoteId, serviceData = {}) {
    return api.patch(`/quotes/${quoteId}/start`, serviceData);
  },

  async completeService(quoteId, completionData = {}) {
    return api.patch(`/quotes/${quoteId}/complete`, completionData);
  },

  // -------------------------------------------
  // Shared endpoints
  // -------------------------------------------

  async getQuoteById(quoteId, params = {}) {
    return api.get(`/quotes/${quoteId}`, { params });
  },

  async getQuotesByListing(listingId, params = {}) {
    return api.get(`/quotes/listing/${listingId}`, { params });
  },
};

export default quoteService;
