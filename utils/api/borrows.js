// Borrows API endpoints
import { apiRequest } from "./index";

export const borrowsAPI = {
  /**
   * Borrow a book
   * @param {object} borrowData
   * @param {string} borrowData.bookId - Book ID (required)
   * @param {string} borrowData.dueAt - Due date in ISO 8601 format (required)
   * @returns {Promise<object>}
   */
  borrowBook: async (borrowData) => {
    return await apiRequest("/borrows", {
      method: "POST",
      body: JSON.stringify(borrowData),
    });
  },

  /**
   * Get list of borrows with pagination and filters
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10, max: 100)
   * @param {string} params.status - Filter by status: "active", "returned", "overdue"
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getBorrows: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const endpoint = `/borrows${queryString ? `?${queryString}` : ""}`;
    return await apiRequest(endpoint, { method: "GET" });
  },

  /**
   * Get borrow by ID
   * @param {string} borrowId
   * @returns {Promise<object>}
   */
  getBorrowById: async (borrowId) => {
    return await apiRequest(`/borrows/${borrowId}`, { method: "GET" });
  },

  /**
   * Return a book
   * @param {string} borrowId
   * @returns {Promise<object>}
   */
  returnBook: async (borrowId) => {
    return await apiRequest(`/borrows/${borrowId}/return`, {
      method: "POST",
    });
  },

  /**
   * Delete borrow history (only if returned)
   * @param {string} borrowId
   * @returns {Promise<object>}
   */
  deleteBorrow: async (borrowId) => {
    return await apiRequest(`/borrows/${borrowId}`, { method: "DELETE" });
  },
};

