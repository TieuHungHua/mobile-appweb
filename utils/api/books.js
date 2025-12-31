// Books API endpoints
import { apiRequest, BASE_URL, getStoredToken } from "./index";

export const booksAPI = {
  /**
   * Get list of books with pagination and filters
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10, max: 100)
   * @param {string} params.search - Search by title
   * @param {string} params.author - Filter by author
   * @param {string} params.category - Filter by category
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getBooks: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.author) queryParams.append("author", params.author);
    if (params.category) queryParams.append("category", params.category);

    const queryString = queryParams.toString();
    const endpoint = `/books${queryString ? `?${queryString}` : ""}`;
    return await apiRequest(endpoint, { method: "GET" });
  },

  /**
   * Get book by ID
   * @param {string} bookId
   * @returns {Promise<object>}
   */
  getBookById: async (bookId) => {
    return await apiRequest(`/books/${bookId}`, { method: "GET" });
  },

  /**
   * Create new book
   * @param {object} bookData - Book data
   * @param {string} bookData.title - Book title (required)
   * @param {string} bookData.author - Author (required)
   * @param {array|string} bookData.categories - Categories (optional)
   * @param {File} bookData.coverImage - Cover image file (optional)
   * @param {string} bookData.coverImageUrl - Cover image URL (optional)
   * @param {number} bookData.availableCopies - Available copies (optional, default: 0)
   * @returns {Promise<object>}
   */
  createBook: async (bookData) => {
    const formData = new FormData();

    formData.append("title", bookData.title);
    formData.append("author", bookData.author);

    if (bookData.categories) {
      if (Array.isArray(bookData.categories)) {
        formData.append("categories", JSON.stringify(bookData.categories));
      } else {
        formData.append("categories", bookData.categories);
      }
    }

    if (bookData.coverImage) {
      formData.append("coverImage", {
        uri: bookData.coverImage.uri,
        type: bookData.coverImage.type || "image/jpeg",
        name: bookData.coverImage.name || "cover.jpg",
      });
    }

    if (bookData.coverImageUrl) {
      formData.append("coverImageUrl", bookData.coverImageUrl);
    }

    if (bookData.availableCopies !== undefined) {
      formData.append("availableCopies", bookData.availableCopies.toString());
    }

    const token = await getStoredToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}/books`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || `HTTP error! status: ${response.status}` };
      }
    }

    if (!response.ok) {
      const errorMessage =
        data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  },

  /**
   * Update book
   * @param {string} bookId
   * @param {object} bookData - Book data to update (all fields optional)
   * @returns {Promise<object>}
   */
  updateBook: async (bookId, bookData) => {
    return await apiRequest(`/books/${bookId}`, {
      method: "PATCH",
      body: JSON.stringify(bookData),
    });
  },

  /**
   * Delete book
   * @param {string} bookId
   * @returns {Promise<object>}
   */
  deleteBook: async (bookId) => {
    return await apiRequest(`/books/${bookId}`, { method: "DELETE" });
  },
};

