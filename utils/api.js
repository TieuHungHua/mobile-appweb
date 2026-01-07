// API Configuration and Service
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Get base URL based on platform
const getBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    console.log(
      "[API] Using BASE_URL from environment:",
      process.env.EXPO_PUBLIC_API_BASE_URL
    );
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  const platform = Platform.OS;
  console.log("[API] Platform detected:", platform);

  // For web platform, use localhost with http (not https)
  if (platform === "web") {
    const url = "http://localhost:3000";
    console.log("[API] Using web URL:", url);
    return url;
  }

  // For Android emulator
  if (platform === "android") {
    const url = "https://be-bklbr.onrender.com";
    console.log("[API] Using Android emulator URL:", url);
    return url;
  }

  // For iOS simulator and default, use production URL or localhost
  // If running locally, use http://localhost:3000
  // If using production, use https://be-bklbr.onrender.com
  const url = "https://be-bklbr.onrender.com";
  console.log("[API] Using default URL:", url);
  return url;
};

const BASE_URL = getBaseUrl();
console.log("[API] Final BASE_URL:", BASE_URL);

// Export BASE_URL for debugging
export { BASE_URL };

/**
 * Test connection to backend server
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    const testUrl = `${BASE_URL}/health`; // Try health endpoint first
    const response = await fetch(testUrl, { method: "GET" });
    return response.ok;
  } catch {
    // If health endpoint doesn't exist, try root
    try {
      const testUrl = `${BASE_URL}/`;
      const response = await fetch(testUrl, { method: "GET" });
      return response.status !== 404; // Any response means server is up
    } catch {
      return false;
    }
  }
};

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  const token = await getStoredToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log(`[API] ${options.method || "GET"} ${url}`);
    console.log(`[API] Platform: ${Platform.OS}, BASE_URL: ${BASE_URL}`);
    if (options.body) {
      console.log(`[API] Request body:`, options.body);
    }

    // Add timeout for fetch (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if response has content
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
      console.error(`[API] Error ${response.status}:`, errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Handle abort (timeout)
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "Request timeout. Server không phản hồi sau 30 giây."
      );
      console.error("[API] Timeout Error:", timeoutError.message);
      throw timeoutError;
    }

    // Handle network errors
    if (
      error.message === "Network request failed" ||
      error.message.includes("Failed to fetch") ||
      error.name === "TypeError"
    ) {
      const platform = Platform.OS;
      console.error("[API] Network Error Details:", {
        platform,
        url,
        baseUrl: BASE_URL,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      });

      let errorMsg = `Không thể kết nối đến server.\n\n`;
      errorMsg += `Platform: ${platform}\n`;
      errorMsg += `URL: ${url}\n\n`;

      if (platform === "web") {
        errorMsg += "Nếu chạy trên web, có thể là lỗi CORS.\n";
        errorMsg += "Kiểm tra DevTools (F12) > Console để xem lỗi chi tiết.";
      } else if (platform === "android") {
        errorMsg += "Đảm bảo backend đang chạy và có thể truy cập từ emulator.";
      } else {
        errorMsg += "Kiểm tra backend server có đang chạy không.";
      }

      const networkError = new Error(errorMsg);
      console.error("[API] Network Error:", networkError.message);
      throw networkError;
    }

    console.error("[API] Request Error:", error.message);
    console.error("[API] Error details:", error);
    throw error;
  }
};

/**
 * Get stored access token
 */
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem("access_token");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

/**
 * Store access token
 */
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem("access_token", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

/**
 * Store refresh token
 */
export const storeRefreshToken = async (token) => {
  try {
    await AsyncStorage.setItem("refresh_token", token);
  } catch (error) {
    console.error("Error storing refresh token:", error);
  }
};

/**
 * Store user info
 */
export const storeUserInfo = async (user) => {
  try {
    await AsyncStorage.setItem("user_info", JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user info:", error);
  }
};

/**
 * Get stored user info
 */
export const getStoredUserInfo = async () => {
  try {
    const userStr = await AsyncStorage.getItem("user_info");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
};

/**
 * Clear all stored auth data
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      "access_token",
      "refresh_token",
      "user_info",
    ]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

/**
 * Validate registration data
 * @param {object} data - Registration data
 * @returns {object} { isValid: boolean, errors: object }
 */
const validateRegisterData = (data) => {
  const errors = {};
  const { username, email, phone, role, studentId, password, confirmPassword } =
    data;

  // 1. Username validation
  if (!username || username.trim() === "") {
    errors.username = "Tên đăng nhập không được để trống";
  }

  // 2. Email validation
  if (!email || email.trim() === "") {
    errors.email = "Email không được để trống";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Email không đúng định dạng";
    }
  }

  // 3. Phone validation
  if (!phone || phone.trim() === "") {
    errors.phone = "Số điện thoại không được để trống";
  } else {
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(phone)) {
      errors.phone = "Số điện thoại phải có 10-11 chữ số";
    }
  }

  // 4. Role validation
  if (!role || (role !== "student" && role !== "lecturer")) {
    errors.role = 'Vai trò phải là "student" hoặc "lecturer"';
  }

  // 5. StudentId validation
  if (role === "student") {
    if (!studentId || studentId.trim() === "") {
      errors.studentId =
        "Mã sinh viên là bắt buộc khi đăng ký tài khoản sinh viên";
    }
  }

  // 6. Password validation
  if (!password || password.trim() === "") {
    errors.password = "Mật khẩu không được để trống";
  } else {
    if (password.length < 6) {
      errors.password = "Mật khẩu phải có tối thiểu 6 ký tự";
    } else {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(
        password
      );
      const digitCount = (password.match(/\d/g) || []).length;

      if (!hasUpperCase) {
        errors.password = "Mật khẩu phải có ít nhất 1 chữ in hoa (A-Z)";
      } else if (!hasSpecialChar) {
        errors.password =
          "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*()_+-=[]{}|;':\",./<>?)";
      } else if (digitCount < 2) {
        errors.password = "Mật khẩu phải có ít nhất 2 chữ số (0-9)";
      }
    }
  }

  // 7. ConfirmPassword validation
  if (!confirmPassword || confirmPassword.trim() === "") {
    errors.confirmPassword = "Xác nhận mật khẩu không được để trống";
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = "Xác nhận mật khẩu không khớp với mật khẩu";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Auth API endpoints
export const authAPI = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
   */
  login: async (username, password) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    // Auto-save tokens and user info after successful login
    if (response.access_token) {
      await storeToken(response.access_token);
    }
    if (response.refresh_token) {
      await storeRefreshToken(response.refresh_token);
    }
    if (response.user) {
      await storeUserInfo(response.user);
    }

    return response;
  },

  /**
   * Register new user
   * @param {object} registerData - Registration data
   * @param {string} registerData.username - Tên đăng nhập (bắt buộc, unique)
   * @param {string} registerData.email - Email (bắt buộc, format email, unique)
   * @param {string} registerData.phone - Số điện thoại (bắt buộc, 10-11 chữ số, unique)
   * @param {string} registerData.role - Loại tài khoản: "student" | "lecturer" (bắt buộc)
   * @param {string} registerData.studentId - Mã sinh viên (bắt buộc nếu role = "student")
   * @param {string} registerData.password - Mật khẩu (bắt buộc)
   * @param {string} registerData.confirmPassword - Xác nhận mật khẩu (bắt buộc)
   * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
   * @throws {Error} If validation fails or registration fails
   */
  register: async (registerData) => {
    // Validate data before sending request
    const validation = validateRegisterData(registerData);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join("\n");
      throw new Error(errorMessage);
    }

    // Prepare request body (include confirmPassword as backend needs it)
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });

    // Auto-save tokens and user info after successful registration
    if (response.access_token) {
      await storeToken(response.access_token);
    }
    if (response.refresh_token) {
      await storeRefreshToken(response.refresh_token);
    }
    if (response.user) {
      await storeUserInfo(response.user);
    }

    return response;
  },
};

// Room Booking API endpoints
export const roomsAPI = {
  /**
   * Get available rooms
   * @param {object} params - Query parameters
   * @param {string} params.start_at - ISO 8601 datetime with timezone (required)
   * @param {string} params.end_at - ISO 8601 datetime with timezone (required)
   * @param {number} params.page - Page number (optional, default 1)
   * @param {number} params.pageSize - Items per page (optional, default 20)
   * @param {string} params.sortBy - Sort field: name, capacity, created_at (optional)
   * @param {string} params.sortDir - Sort direction: asc, desc (optional)
   * @returns {Promise<{items: Array, meta: object}>}
   */
  getRooms: async (params) => {
    const queryParams = new URLSearchParams();
    queryParams.append("start_at", params.start_at);
    queryParams.append("end_at", params.end_at);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortDir) queryParams.append("sortDir", params.sortDir);

    return await apiRequest(`/api/v1/rooms?${queryParams.toString()}`, {
      method: "GET",
    });
  },
};

export const bookingsAPI = {
  /**
   * Create a new booking
   * @param {object} bookingData - Booking data
   * @param {string} bookingData.room_id - Room ID (UUID)
   * @param {string} bookingData.start_at - ISO 8601 datetime with timezone (e.g., "2024-01-01T08:00:00+07:00")
   * @param {string} bookingData.end_at - ISO 8601 datetime with timezone
   * @param {string} bookingData.purpose - Purpose of booking (required, not empty)
   * @param {number} bookingData.attendee_count - Number of attendees (1 <= count <= room.capacity)
   * @returns {Promise<object>} Booking object
   */
  create: async (bookingData) => {
    return await apiRequest("/api/v1/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  /**
   * Search bookings with criteria
   * @param {object} criteria - Search criteria
   * @param {number} criteria.page - Page number (optional, default 1)
   * @param {number} criteria.pageSize - Items per page (optional, default 20)
   * @param {Array} criteria.filters - Filter array (optional)
   * @param {Array} criteria.sorts - Sort array (optional)
   * @returns {Promise<{items: Array, meta: object}>}
   */
  search: async (criteria) => {
    return await apiRequest("/api/v1/bookings/search", {
      method: "POST",
      body: JSON.stringify(criteria),
    });
  },

  /**
   * Get booking by ID
   * @param {string} id - Booking ID
   * @returns {Promise<object>} Booking object
   */
  getById: async (id) => {
    return await apiRequest(`/api/v1/bookings/${id}`, {
      method: "GET",
    });
  },

  /**
   * Cancel a booking
   * @param {string} id - Booking ID
   * @param {string} reason - Cancel reason
   * @returns {Promise<object>} Updated booking object
   */
  cancel: async (id, reason) => {
    return await apiRequest(`/api/v1/bookings/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },
};

// Books API endpoints
export const booksAPI = {
  /**
   * Get list of books with filters and infinite scroll support
   * @param {object} params - Query parameters
   * @param {number} params.limit - Number of books per request (default: 20)
   * @param {number} params.page - Page number (for infinite scroll, starts at 1)
   * @param {string} params.search - Search by book title (case insensitive)
   * @param {string} params.author - Filter by author (case insensitive)
   * @param {string} params.category - Filter by category
   * @param {string} params.sortBy - Sort field: "createdAt" | "title" | "author" (default: "createdAt")
   * @param {string} params.sortOrder - Sort order: "asc" | "desc" (default: "desc")
   * @param {string} params.status - Filter by status: "available" (optional)
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getBooks: async (params = {}) => {
    const {
      limit = 20,
      page = 1,
      search,
      author,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (author) queryParams.append("author", author);
    if (category) queryParams.append("category", category);
    if (status) queryParams.append("status", status);
    queryParams.append("sortBy", sortBy);
    queryParams.append("sortOrder", sortOrder);

    const endpoint = `/books?${queryParams.toString()}`;
    return await apiRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get book detail by ID
   * @param {string} bookId - Book ID
   * @returns {Promise<object>} Book detail object
   */
  getBookById: async (bookId) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    const endpoint = `/books/${bookId}`;
    return await apiRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Toggle favorite status for a book
   * @param {string} bookId - Book ID
   * @returns {Promise<object>} Response with isFavorite status
   */
  toggleFavorite: async (bookId) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    const endpoint = `/books/${bookId}/favorite`;
    return await apiRequest(endpoint, {
      method: "POST",
    });
  },

  /**
   * Check if book is favorited by current user
   * @param {string} bookId - Book ID
   * @returns {Promise<{bookId: string, isFavorite: boolean, favoriteId: string|null}>}
   */
  checkFavorite: async (bookId) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    const endpoint = `/books/${bookId}/favorite`;
    return await apiRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get list of favorite books with pagination
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of books per page (default: 20)
   * @param {string} params.search - Search by book title or author (optional)
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getFavorites: async (params = {}) => {
    const { page = 1, limit = 20, search } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);

    const endpoint = `/books/favorites?${queryParams.toString()}`;
    return await apiRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get list of saved (bookmarked) books with pagination
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of books per page (default: 20)
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getSaved: async (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const endpoint = `/books/saved?${queryParams.toString()}`;
    return await apiRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Toggle save/bookmark status for a book
   * @param {string} bookId - Book ID
   * @returns {Promise<{bookId: string, isSaved: boolean, savedId?: string|null}>}
   */
  toggleSave: async (bookId) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    const endpoint = `/books/${bookId}/save`;
    return await apiRequest(endpoint, {
      method: "POST",
    });
  },
};

// Comments API endpoints
export const commentsAPI = {
  /**
   * Get list of comments for a book
   * @param {string} bookId - Book ID
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of comments per page (default: 10)
   * @returns {Promise<{data: array, pagination: object}>}
   */
  getComments: async (bookId, params = {}) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const endpoint = `/books/${bookId}/comments?${queryParams.toString()}`;
    return await apiRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Add a comment to a book
   * @param {string} bookId - Book ID
   * @param {string} content - Comment content
   * @returns {Promise<object>} Comment object
   */
  addComment: async (bookId, content) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    if (!content || content.trim() === "") {
      throw new Error("Nội dung bình luận không được để trống");
    }
    const endpoint = `/books/${bookId}/comments`;
    return await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({ content: content.trim() }),
    });
  },

  /**
   * Update a comment
   * @param {string} bookId - Book ID
   * @param {string} commentId - Comment ID
   * @param {string} content - Updated comment content
   * @returns {Promise<object>} Updated comment object
   */
  updateComment: async (bookId, commentId, content) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    if (!commentId) {
      throw new Error("Comment ID is required");
    }
    if (!content || content.trim() === "") {
      throw new Error("Nội dung bình luận không được để trống");
    }
    const endpoint = `/books/${bookId}/comments/${commentId}`;
    return await apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify({ content: content.trim() }),
    });
  },

  /**
   * Delete a comment
   * @param {string} bookId - Book ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<object>} Success message
   */
  deleteComment: async (bookId, commentId) => {
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    if (!commentId) {
      throw new Error("Comment ID is required");
    }
    const endpoint = `/books/${bookId}/comments/${commentId}`;
    return await apiRequest(endpoint, {
      method: "DELETE",
    });
  },
};

// Borrows API endpoints
export const borrowsAPI = {
  /**
   * Borrow a book from the library
   * @param {object} borrowData - Borrow data
   * @param {string} borrowData.bookId - Book ID (required, UUID)
   * @param {string} borrowData.dueAt - Due date in ISO 8601 format (required, must be future date)
   * @returns {Promise<object>} Borrow object with user, book, dates, and status
   * @throws {Error} If validation fails, book not available, or already borrowed
   */
  borrowBook: async ({ bookId, dueAt }) => {
    // Validate required fields
    if (!bookId || bookId.trim() === "") {
      throw new Error("ID sách không được để trống");
    }

    if (!dueAt || dueAt.trim() === "") {
      throw new Error("Ngày hết hạn không được để trống");
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(bookId)) {
      throw new Error("ID sách không hợp lệ (phải là UUID)");
    }

    // Validate ISO 8601 date format and future date
    try {
      const dueDate = new Date(dueAt);
      if (isNaN(dueDate.getTime())) {
        throw new Error("Ngày hết hạn không hợp lệ");
      }
      const now = new Date();
      if (dueDate <= now) {
        throw new Error("Ngày hết hạn phải là ngày trong tương lai");
      }
    } catch (error) {
      if (error.message.includes("Ngày hết hạn")) {
        throw error;
      }
      throw new Error("Ngày hết hạn không đúng định dạng ISO 8601");
    }

    const response = await apiRequest("/borrows", {
      method: "POST",
      body: JSON.stringify({ bookId, dueAt }),
    });

    return response;
  },

  /**
   * Get list of borrowed books for current user
   * @param {object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of records per page (default: 20)
   * @param {string} params.search - Search by book title/author
   * @param {string} params.status - Filter by status (active/expired/returned)
   */
  getBorrows: async (params = {}) => {
    const {
      page = 1,
      limit = 20,
      search,
      status = "active",
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (status) queryParams.append("status", status);

    const endpoint = `/borrows?${queryParams.toString()}`;
    return await apiRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Renew a borrowed book
   * @param {string} borrowId - Borrow record ID
   * @param {number} days - Number of days to extend (1-30 days)
   */
  renewBorrow: async (borrowId, days) => {
    if (!borrowId) {
      throw new Error("Borrow ID is required");
    }
    if (!days || days < 1 || days > 30) {
      throw new Error("Số ngày gia hạn phải từ 1 đến 30 ngày");
    }
    // Theo tài liệu API: POST /borrows/:id/renew
    const endpoint = `/borrows/${borrowId}/renew`;
    const body = { days };
    console.log(`[API] Renew borrow: ${endpoint}`, { borrowId, days, body });
    return await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Return a borrowed book
   * @param {string} borrowId - Borrow record ID
   * @returns {Promise<object>} Updated borrow object with returned status
   */
  returnBook: async (borrowId) => {
    if (!borrowId) {
      throw new Error("Borrow ID is required");
    }
    const endpoint = `/borrows/${borrowId}/return`;
    return await apiRequest(endpoint, {
      method: "POST",
    });
  },
};

// User API endpoints
export const userAPI = {
  /**
   * Get current user profile
   * @returns {Promise<object>} User profile object
   */
  getProfile: async () => {
    const response = await apiRequest("/users/profile", {
      method: "GET",
    });

    // Update stored user info
    if (response.user || response) {
      const userData = response.user || response;
      await storeUserInfo(userData);
      return userData;
    }

    return response;
  },

  /**
   * Update user profile information with file upload support
   * @param {object} params - Update parameters
   * @param {string} params.userId - User ID
   * @param {string} params.displayName - Display name (optional)
   * @param {string} params.email - Email (optional, must be valid email, unique)
   * @param {string} params.studentId - Student ID or Lecturer ID (optional)
   * @param {string} params.classMajor - Class/Major (optional)
   * @param {string} params.dateOfBirth - Date of birth in YYYY-MM-DD format (optional)
   * @param {string} params.gender - Gender: "male" | "female" | "other" (optional)
   * @param {string} params.role - Role: "student" | "admin" | "lecturer" (optional)
   * @param {string} params.avatarUri - Local URI of avatar image to upload (optional)
   * @returns {Promise<{user: object}>}
   */
  updateProfile: async ({ userId, displayName, email, studentId, classMajor, dateOfBirth, gender, role, avatarUri }) => {
    const url = `${BASE_URL}/users/${userId}`;
    const token = await getStoredToken();

    // Create FormData
    const formData = new FormData();

    // Add text fields (all optional)
    if (displayName) {
      formData.append("displayName", displayName);
    }
    if (email) {
      formData.append("email", email);
    }
    if (studentId) {
      formData.append("studentId", studentId);
    }
    if (classMajor) {
      formData.append("classMajor", classMajor);
    }
    if (dateOfBirth) {
      formData.append("dateOfBirth", dateOfBirth);
    }
    if (gender) {
      formData.append("gender", gender);
    }
    if (role) {
      formData.append("role", role);
    }
    // Note: Password is not sent in body, authentication is done via Bearer token

    // Add avatar file if provided (only if it's a local URI)
    if (avatarUri) {
      // Check if it's a local URI (needs upload) or remote URL (already uploaded)
      const isLocalUri = avatarUri.startsWith("file://") ||
        avatarUri.startsWith("content://") ||
        avatarUri.startsWith("ph://") ||
        avatarUri.startsWith("/");

      if (isLocalUri) {
        // Extract file name and type from URI
        const uriParts = avatarUri.split(".");
        const fileType = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase() : "jpg";
        const fileName = `avatar_${Date.now()}.${fileType}`;

        // For React Native, FormData expects this format
        const avatarFile = {
          uri: Platform.OS === "android" ? avatarUri : avatarUri.replace("file://", ""),
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
          name: fileName,
        };
        formData.append("avatar", avatarFile);
      } else {
        console.log("[API] Avatar is already a remote URL, skipping file upload");
      }
    }

    // Prepare headers
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData, let browser set it with boundary

    try {
      console.log(`[API] PATCH ${url}`);
      console.log(`[API] FormData fields:`, {
        displayName,
        email,
        studentId,
        classMajor,
        dateOfBirth,
        gender,
        role,
        hasAvatar: !!avatarUri,
      });

      // Add timeout for fetch (60 seconds for file upload)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response has content
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
        console.error(`[API] Error ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Update stored user info after successful update
      if (data.user) {
        await storeUserInfo(data.user);
      }

      return data;
    } catch (error) {
      // Handle abort (timeout)
      if (error.name === "AbortError") {
        const timeoutError = new Error(
          "Request timeout. Server không phản hồi sau 60 giây."
        );
        console.error("[API] Timeout Error:", timeoutError.message);
        throw timeoutError;
      }

      // Handle network errors
      if (
        error.message === "Network request failed" ||
        error.message.includes("Failed to fetch") ||
        error.name === "TypeError"
      ) {
        const networkError = new Error(
          "Không thể kết nối đến server để cập nhật thông tin."
        );
        console.error("[API] Network Error:", networkError.message);
        throw networkError;
      }

      console.error("[API] Update Profile Error:", error.message);
      throw error;
    }
  },
};