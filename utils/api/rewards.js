// Rewards API endpoints
import { apiRequest } from "./index";

export const rewardsAPI = {
  /**
   * Get list of rewards with pagination
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10, max: 100)
   * @param {boolean} params.active - Filter by active status
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getRewards: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.active !== undefined)
      queryParams.append("active", params.active.toString());

    const queryString = queryParams.toString();
    const endpoint = `/rewards${queryString ? `?${queryString}` : ""}`;
    return await apiRequest(endpoint, { method: "GET" });
  },

  /**
   * Get reward by ID
   * @param {string} rewardId
   * @returns {Promise<object>}
   */
  getRewardById: async (rewardId) => {
    return await apiRequest(`/rewards/${rewardId}`, { method: "GET" });
  },

  /**
   * Create new reward
   * @param {object} rewardData - Reward data
   * @param {string} rewardData.name - Reward name (required)
   * @param {string} rewardData.description - Description (optional)
   * @param {number} rewardData.costPoints - Cost in points (required, min: 1)
   * @param {number} rewardData.stock - Stock quantity (optional, default: 0)
   * @param {boolean} rewardData.active - Active status (optional, default: true)
   * @returns {Promise<object>}
   */
  createReward: async (rewardData) => {
    return await apiRequest("/rewards", {
      method: "POST",
      body: JSON.stringify(rewardData),
    });
  },

  /**
   * Update reward
   * @param {string} rewardId
   * @param {object} rewardData - Reward data to update (all fields optional)
   * @returns {Promise<object>}
   */
  updateReward: async (rewardId, rewardData) => {
    return await apiRequest(`/rewards/${rewardId}`, {
      method: "PATCH",
      body: JSON.stringify(rewardData),
    });
  },

  /**
   * Delete reward
   * @param {string} rewardId
   * @returns {Promise<object>}
   */
  deleteReward: async (rewardId) => {
    return await apiRequest(`/rewards/${rewardId}`, { method: "DELETE" });
  },
};

