// Wallet API Service: Handles all wallet-related API requests
import api from './apiService';

export const walletApi = {
  // Get wallet balance
  getBalance: async () => {
    try {
      const response = await api.get('/wallet/balance');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch wallet balance',
        code: error.response?.data?.code,
      };
    }
  },

  // Get wallet info with statistics
  getWalletInfo: async () => {
    try {
      const response = await api.get('/wallet/info');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch wallet info',
        code: error.response?.data?.code,
      };
    }
  },

  // Get transaction history
  getTransactionHistory: async (params = {}) => {
    try {
      const {
        limit = 50,
        offset = 0,
        status,
        type,
        startDate,
        endDate,
      } = params;

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (status) queryParams.append('status', status);
      if (type) queryParams.append('type', type);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await api.get(`/wallet/history?${queryParams}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch transaction history',
        code: error.response?.data?.code,
      };
    }
  },

  // Lock wallet
  lockWallet: async (reason = '') => {
    try {
      const response = await api.post('/wallet/lock', { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to lock wallet',
        code: error.response?.data?.code,
      };
    }
  },

  // Unlock wallet
  unlockWallet: async (otpCode = null, emergencyCode = null) => {
    try {
      const payload = {};
      if (otpCode) payload.otpCode = otpCode;
      if (emergencyCode) payload.emergencyCode = emergencyCode;
      
      const response = await api.post('/wallet/unlock', payload);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to unlock wallet',
        code: error.response?.data?.code,
      };
    }
  },

  // Get analytics data
  getAnalytics: async (period = 30) => {
    try {
      const response = await api.get(`/wallet/analytics?period=${period}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch analytics',
        code: error.response?.data?.code,
      };
    }
  },

  // Request OTP for daily limit change
  requestLimitOTP: async () => {
    try {
      const response = await api.post('/wallet/request-limit-otp');
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to request limit OTP',
        code: error.response?.data?.code,
      };
    }
  },

  // Set daily limit with OTP verification
  setDailyLimit: async (dailyLimit, otpCode) => {
    try {
      const response = await api.post('/wallet/set-limit', {
        dailyLimit,
        otpCode
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to set daily limit',
        code: error.response?.data?.code,
      };
    }
  },

  // Emergency freeze wallet
  emergencyFreeze: async (reason = 'Emergency freeze initiated by user') => {
    try {
      const response = await api.post('/wallet/emergency-freeze', { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to emergency freeze wallet',
        code: error.response?.data?.code,
      };
    }
  },
};

export default walletApi;
