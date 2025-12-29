// API Configuration and Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get base URL based on platform
const getBaseUrl = () => {
    // If environment variable is set, use it
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
        console.log('[API] Using BASE_URL from environment:', process.env.EXPO_PUBLIC_API_BASE_URL);
        return process.env.EXPO_PUBLIC_API_BASE_URL;
    }

    const platform = Platform.OS;
    console.log('[API] Platform detected:', platform);

    // For Android emulator, use 10.0.2.2 instead of localhost
    if (platform === 'android') {
        const url = 'https://be-bklbr.onrender.com';
        console.log('[API] Using Android emulator URL:', url);
        return url;
    }

    // For iOS simulator and web, use localhost
    const url = 'https://be-bklbr.onrender.com';
    console.log('[API] Using default URL:', url);
    return url;
};

const BASE_URL = getBaseUrl();
console.log('[API] Final BASE_URL:', BASE_URL);

// Export BASE_URL for debugging
export { BASE_URL };

/**
 * Test connection to backend server
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
    try {
        const testUrl = `${BASE_URL}/health`; // Try health endpoint first
        const response = await fetch(testUrl, { method: 'GET' });
        return response.ok;
    } catch {
        // If health endpoint doesn't exist, try root
        try {
            const testUrl = `${BASE_URL}/`;
            const response = await fetch(testUrl, { method: 'GET' });
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
        'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    const token = await getStoredToken();
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        console.log(`[API] ${options.method || 'GET'} ${url}`);
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
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
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
            const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
            console.error(`[API] Error ${response.status}:`, errorMessage);
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        // Handle abort (timeout)
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Request timeout. Server không phản hồi sau 30 giây.');
            console.error('[API] Timeout Error:', timeoutError.message);
            throw timeoutError;
        }

        // Handle network errors
        if (error.message === 'Network request failed' || error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            const platform = Platform.OS;
            console.error('[API] Network Error Details:', {
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

            if (platform === 'web') {
                errorMsg += 'Nếu chạy trên web, có thể là lỗi CORS.\n';
                errorMsg += 'Kiểm tra DevTools (F12) > Console để xem lỗi chi tiết.';
            } else if (platform === 'android') {
                errorMsg += 'Đảm bảo backend đang chạy và có thể truy cập từ emulator.';
            } else {
                errorMsg += 'Kiểm tra backend server có đang chạy không.';
            }

            const networkError = new Error(errorMsg);
            console.error('[API] Network Error:', networkError.message);
            throw networkError;
        }

        console.error('[API] Request Error:', error.message);
        console.error('[API] Error details:', error);
        throw error;
    }
};

/**
 * Get stored access token
 */
export const getStoredToken = async () => {
    try {
        return await AsyncStorage.getItem('access_token');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

/**
 * Store access token
 */
export const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem('access_token', token);
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

/**
 * Store refresh token
 */
export const storeRefreshToken = async (token) => {
    try {
        await AsyncStorage.setItem('refresh_token', token);
    } catch (error) {
        console.error('Error storing refresh token:', error);
    }
};

/**
 * Store user info
 */
export const storeUserInfo = async (user) => {
    try {
        await AsyncStorage.setItem('user_info', JSON.stringify(user));
    } catch (error) {
        console.error('Error storing user info:', error);
    }
};

/**
 * Get stored user info
 */
export const getStoredUserInfo = async () => {
    try {
        const userStr = await AsyncStorage.getItem('user_info');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
};

/**
 * Clear all stored auth data
 */
export const clearAuthData = async () => {
    try {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_info']);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

/**
 * Validate registration data
 * @param {object} data - Registration data
 * @returns {object} { isValid: boolean, errors: object }
 */
const validateRegisterData = (data) => {
    const errors = {};
    const { username, email, phone, role, studentId, password, confirmPassword } = data;

    // 1. Username validation
    if (!username || username.trim() === '') {
        errors.username = 'Tên đăng nhập không được để trống';
    }

    // 2. Email validation
    if (!email || email.trim() === '') {
        errors.email = 'Email không được để trống';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = 'Email không đúng định dạng';
        }
    }

    // 3. Phone validation
    if (!phone || phone.trim() === '') {
        errors.phone = 'Số điện thoại không được để trống';
    } else {
        const phoneRegex = /^\d{10,11}$/;
        if (!phoneRegex.test(phone)) {
            errors.phone = 'Số điện thoại phải có 10-11 chữ số';
        }
    }

    // 4. Role validation
    if (!role || (role !== 'student' && role !== 'lecturer')) {
        errors.role = 'Vai trò phải là "student" hoặc "lecturer"';
    }

    // 5. StudentId validation
    if (role === 'student') {
        if (!studentId || studentId.trim() === '') {
            errors.studentId = 'Mã sinh viên là bắt buộc khi đăng ký tài khoản sinh viên';
        }
    }

    // 6. Password validation
    if (!password || password.trim() === '') {
        errors.password = 'Mật khẩu không được để trống';
    } else {
        if (password.length < 6) {
            errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
        } else {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password);
            const digitCount = (password.match(/\d/g) || []).length;

            if (!hasUpperCase) {
                errors.password = 'Mật khẩu phải có ít nhất 1 chữ in hoa (A-Z)';
            } else if (!hasSpecialChar) {
                errors.password = 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*()_+-=[]{}|;\':",./<>?)';
            } else if (digitCount < 2) {
                errors.password = 'Mật khẩu phải có ít nhất 2 chữ số (0-9)';
            }
        }
    }

    // 7. ConfirmPassword validation
    if (!confirmPassword || confirmPassword.trim() === '') {
        errors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (password && confirmPassword !== password) {
        errors.confirmPassword = 'Xác nhận mật khẩu không khớp với mật khẩu';
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
        const response = await apiRequest('/auth/login', {
            method: 'POST',
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
            const errorMessage = Object.values(validation.errors).join('\n');
            throw new Error(errorMessage);
        }

        // Prepare request body (include confirmPassword as backend needs it)
        const response = await apiRequest('/auth/register', {
            method: 'POST',
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

