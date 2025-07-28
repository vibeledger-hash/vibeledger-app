// Authentication API Service: Handles auth-related API requests
import api from './apiService';

export const authApi = {
  // Send OTP for login
  sendLoginOTP: async (phoneNumber) => {
    try {
      const response = await api.post('/auth/send-otp', {
        phoneNumber,
        purpose: 'login',
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send OTP',
        code: error.response?.data?.code,
      };
    }
  },

  // Verify OTP and login
  verifyLoginOTP: async (phoneNumber, otpCode) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        phoneNumber,
        otpCode,
        purpose: 'login',
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid OTP',
        code: error.response?.data?.code,
      };
    }
  },

  // Register new user
  register: async (phoneNumber) => {
    try {
      const response = await api.post('/auth/register', {
        phoneNumber,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
        code: error.response?.data?.code,
      };
    }
  },

  // Refresh JWT token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Token refresh failed',
        code: error.response?.data?.code,
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Logout failed',
        code: error.response?.data?.code,
      };
    }
  },
};

export default authApi;
