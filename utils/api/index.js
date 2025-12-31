// API Configuration and Core Functions
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

  // For Android emulator, use 10.0.2.2 instead of localhost
  if (platform === "android") {
    const url = "https://be-bklbr.onrender.com";
    console.log("[API] Using Android emulator URL:", url);
    return url;
  }

  // For iOS simulator and web, use localhost
  const url = "https://be-bklbr.onrender.com";
  console.log("[API] Using default URL:", url);
  return url;
};

export const BASE_URL = getBaseUrl();
console.log("[API] Final BASE_URL:", BASE_URL);

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

