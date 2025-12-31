// Users API endpoints
import { apiRequest } from "./index";

export const usersAPI = {
  /**
   * Get list of users with pagination and filters
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10, max: 100)
   * @param {string} params.role - Filter by role: "student", "lecturer", "admin"
   * @param {string} params.search - Search by username
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.role) queryParams.append("role", params.role);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ""}`;
    return await apiRequest(endpoint, { method: "GET" });
  },

  /**
   * Get user by ID
   * @param {string} userId
   * @returns {Promise<object>}
   */
  getUserById: async (userId) => {
    return await apiRequest(`/users/${userId}`, { method: "GET" });
  },

  /**
   * Create new user (admin only)
   * @param {object} userData - User data
   * @returns {Promise<object>}
   */
  createUser: async (userData) => {
    return await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user
   * @param {string} userId
   * @param {object} userData - User data to update (all fields optional)
   * @returns {Promise<object>}
   */
  updateUser: async (userId, userData) => {
    return await apiRequest(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user
   * @param {string} userId
   * @returns {Promise<object>}
   */
  deleteUser: async (userId) => {
    return await apiRequest(`/users/${userId}`, { method: "DELETE" });
  },
};

