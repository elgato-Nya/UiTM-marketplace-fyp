/**
 * Analytics Service
 * Handles public analytics API calls
 */

import api from "./api";

/**
 * Get public platform statistics
 * @returns {Promise<Object>} Public platform stats
 */
export const getPublicStats = async () => {
  try {
    const response = await api.get("/analytics/public/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching public stats:", error);
    throw error;
  }
};

export default {
  getPublicStats,
};
