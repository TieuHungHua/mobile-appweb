// Upload API endpoints
import { BASE_URL, getStoredToken, apiRequest } from "./index";

export const uploadAPI = {
  /**
   * Upload avatar image
   * @param {object} fileData - File data
   * @param {string} fileData.uri - File URI
   * @param {string} fileData.type - File MIME type (default: 'image/jpeg')
   * @param {string} fileData.name - File name (default: 'avatar.jpg')
   * @returns {Promise<{url: string, publicId: string, secureUrl: string, width: number, height: number, format: string, bytes: number}>}
   */
  uploadAvatar: async (fileData) => {
    const formData = new FormData();
    formData.append("file", {
      uri: fileData.uri,
      type: fileData.type || "image/jpeg",
      name: fileData.name || "avatar.jpg",
    });

    const token = await getStoredToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}/upload/avatar`;
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
   * Upload book cover image
   * @param {object} fileData - File data
   * @param {string} fileData.uri - File URI
   * @param {string} fileData.type - File MIME type (default: 'image/jpeg')
   * @param {string} fileData.name - File name (default: 'cover.jpg')
   * @returns {Promise<{url: string, publicId: string, secureUrl: string, width: number, height: number, format: string, bytes: number}>}
   */
  uploadBookImage: async (fileData) => {
    const formData = new FormData();
    formData.append("file", {
      uri: fileData.uri,
      type: fileData.type || "image/jpeg",
      name: fileData.name || "cover.jpg",
    });

    const token = await getStoredToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}/upload/book`;
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
   * Delete image from Cloudinary
   * @param {string} publicId - Public ID of the image
   * @returns {Promise<{message: string, publicId: string, result: string}>}
   */
  deleteImage: async (publicId) => {
    return await apiRequest(`/upload/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
  },
};

