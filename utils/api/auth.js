// Auth API endpoints
import { apiRequest, storeToken, storeRefreshToken, storeUserInfo } from "./index";

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

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @returns {Promise<{access_token: string, refresh_token: string}>}
   */
  refresh: async (refreshToken) => {
    const response = await apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Auto-save new tokens
    if (response.access_token) {
      await storeToken(response.access_token);
    }
    if (response.refresh_token) {
      await storeRefreshToken(response.refresh_token);
    }

    return response;
  },
};

