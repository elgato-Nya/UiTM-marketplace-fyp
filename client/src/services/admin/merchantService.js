import api from "../api";

/**
 * Admin Merchant Management Service
 *
 * PURPOSE: Handle API calls for admin merchant verification and management
 */

const BASE_URL = "/admin/merchants";

/**
 * Get list of merchants with filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (all/pending/unverified/verified/rejected/suspended)
 * @param {string} params.search - Search term
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Merchants list with pagination
 */
export const getMerchants = async (params = {}) => {
  const { status = "all", search = "", page = 1, limit = 20 } = params;

  const queryParams = new URLSearchParams({
    status,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  const response = await api.get(`${BASE_URL}?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get single merchant details
 * @param {string} userId - Merchant user ID
 * @returns {Promise<Object>} Merchant details
 */
export const getMerchantDetails = async (userId) => {
  const response = await api.get(`${BASE_URL}/${userId}`);
  return response.data;
};

/**
 * Approve merchant verification
 * @param {string} userId - Merchant user ID
 * @param {string} note - Optional approval note
 * @returns {Promise<Object>} Success response
 */
export const verifyMerchant = async (userId, note = "") => {
  const response = await api.put(`${BASE_URL}/${userId}/verify`, { note });
  return response.data;
};

/**
 * Reject merchant verification
 * @param {string} userId - Merchant user ID
 * @param {string} reason - Rejection reason (required)
 * @returns {Promise<Object>} Success response
 */
export const rejectMerchant = async (userId, reason) => {
  const response = await api.put(`${BASE_URL}/${userId}/reject`, { reason });
  return response.data;
};

/**
 * Suspend merchant
 * @param {string} userId - Merchant user ID
 * @param {string} reason - Suspension reason (required)
 * @returns {Promise<Object>} Success response
 */
export const suspendMerchant = async (userId, reason) => {
  const response = await api.put(`${BASE_URL}/${userId}/suspend`, { reason });
  return response.data;
};

/**
 * Reactivate suspended merchant
 * @param {string} userId - Merchant user ID
 * @returns {Promise<Object>} Success response
 */
export const reactivateMerchant = async (userId) => {
  const response = await api.put(`${BASE_URL}/${userId}/reactivate`);
  return response.data;
};

const adminMerchantService = {
  getMerchants,
  getMerchantDetails,
  verifyMerchant,
  rejectMerchant,
  suspendMerchant,
  reactivateMerchant,
};

export default adminMerchantService;
