// Transaction API Service: Handles payment transactions
import api from './apiService';

export const transactionApi = {
  // Initiate a new transaction
  initiateTransaction: async (transactionData) => {
    try {
      const response = await api.post('/transaction/initiate', transactionData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to initiate transaction',
        code: error.response?.data?.code,
      };
    }
  },

  // Confirm transaction with OTP
  confirmTransaction: async (transactionId, otpCode) => {
    try {
      const response = await api.post('/transaction/confirm', {
        transactionId,
        otpCode,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Transaction confirmation failed',
        code: error.response?.data?.code,
      };
    }
  },

  // Cancel a pending transaction
  cancelTransaction: async (transactionId, reason = '') => {
    try {
      const response = await api.post('/transaction/cancel', {
        transactionId,
        reason,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel transaction',
        code: error.response?.data?.code,
      };
    }
  },

  // Get transaction status
  getTransactionStatus: async (transactionId) => {
    try {
      const response = await api.get(`/transaction/status/${transactionId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch transaction status',
        code: error.response?.data?.code,
      };
    }
  },

  // Request refund
  requestRefund: async (transactionId, reason) => {
    try {
      const response = await api.post('/transaction/refund', {
        transactionId,
        reason,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Refund request failed',
        code: error.response?.data?.code,
      };
    }
  },

  // Sync offline transactions
  syncOfflineTransactions: async (transactions) => {
    try {
      const response = await api.post('/transaction/sync', {
        transactions,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Transaction sync failed',
        code: error.response?.data?.code,
      };
    }
  },
};

export default transactionApi;
