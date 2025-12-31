// Comments API endpoints
import { apiRequest } from "./index";

export const commentsAPI = {
  /**
   * Get comments for a book
   * @param {string} bookId
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10, max: 100)
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getComments: async (bookId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString();
    const endpoint = `/books/${bookId}/comments${
      queryString ? `?${queryString}` : ""
    }`;
    return await apiRequest(endpoint, { method: "GET" });
  },

  /**
   * Create comment for a book
   * @param {string} bookId
   * @param {object} commentData
   * @param {string} commentData.content - Comment content (1-1000 characters, required)
   * @returns {Promise<object>}
   */
  createComment: async (bookId, commentData) => {
    return await apiRequest(`/books/${bookId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  },

  /**
   * Update comment
   * @param {string} bookId
   * @param {string} commentId
   * @param {object} commentData
   * @param {string} commentData.content - New comment content (1-1000 characters, required)
   * @returns {Promise<object>}
   */
  updateComment: async (bookId, commentId, commentData) => {
    return await apiRequest(`/books/${bookId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(commentData),
    });
  },

  /**
   * Delete comment
   * @param {string} bookId
   * @param {string} commentId
   * @returns {Promise<{message: string}>}
   */
  deleteComment: async (bookId, commentId) => {
    return await apiRequest(`/books/${bookId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};

