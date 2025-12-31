// Main API file - Re-export all API modules for backward compatibility
// All APIs are now organized in separate files in the api/ directory

// Core functions and configuration
export {
  BASE_URL,
  testConnection,
  apiRequest,
  getStoredToken,
  storeToken,
  storeRefreshToken,
  storeUserInfo,
  getStoredUserInfo,
  clearAuthData,
} from "./api/index";

// Auth API
export { authAPI } from "./api/auth";

// Books API
export { booksAPI } from "./api/books";

// Borrows API
export { borrowsAPI } from "./api/borrows";

// Comments API
export { commentsAPI } from "./api/comments";

// Users API
export { usersAPI } from "./api/users";

// Upload API
export { uploadAPI } from "./api/upload";

// Rewards API
export { rewardsAPI } from "./api/rewards";
