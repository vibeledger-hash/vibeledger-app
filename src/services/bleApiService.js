// BLE API Service: Handles BLE merchant discovery and registration
import api from './apiService';

export const bleApi = {
  // Discover nearby merchants
  discoverMerchants: async (params = {}) => {
    try {
      const {
        latitude,
        longitude,
        radius = 5,
        category,
        limit = 20,
      } = params;

      const queryParams = new URLSearchParams({
        radius: radius.toString(),
        limit: limit.toString(),
      });

      if (latitude && longitude) {
        queryParams.append('latitude', latitude.toString());
        queryParams.append('longitude', longitude.toString());
      }
      if (category) queryParams.append('category', category);

      const response = await api.post(`/ble/discover?${queryParams}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to discover merchants',
        code: error.response?.data?.code,
      };
    }
  },

  // Get merchant categories
  getMerchantCategories: async () => {
    try {
      const response = await api.get('/ble/categories');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch categories',
        code: error.response?.data?.code,
      };
    }
  },

  // Register a new merchant (for merchant app)
  registerMerchant: async (merchantData) => {
    try {
      const response = await api.post('/ble/register', merchantData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to register merchant',
        code: error.response?.data?.code,
      };
    }
  },

  // Verify merchant by QR code
  verifyMerchantByQR: async (qrCode) => {
    try {
      const response = await api.post('/ble/verify-qr', { qrCode });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid QR code',
        code: error.response?.data?.code,
      };
    }
  },

  // Verify merchant by BLE ID
  verifyMerchantByBLE: async (bleId) => {
    try {
      const response = await api.post('/ble/verify-ble', { bleId });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid BLE ID',
        code: error.response?.data?.code,
      };
    }
  },
};

export default bleApi;
