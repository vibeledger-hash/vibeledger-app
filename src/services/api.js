// API Service for VibeLedger App
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Initialize the service by loading stored token
  async init() {
    try {
      this.token = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: 10000, // 10 seconds timeout
      ...options,
    };

    // Add auth token if available
    if (this.token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    // Convert body to JSON if it's an object
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      console.log('Request body:', config.body);
      
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API Response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      
      // Check if it's a network error
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and backend server.');
      }
      
      throw error;
    }
  }

  // Authentication methods
  async requestOTP(phoneNumber) {
    return this.request('/api/auth/request-otp', {
      method: 'POST',
      body: { phoneNumber, purpose: 'login' },
    });
  }

  async verifyOTP(otpId, otp, phoneNumber) {
    const response = await this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: { otpId, otp, phoneNumber },
    });

    // Store the token
    if (response.token) {
      this.token = response.token;
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response;
  }

  // Wallet methods
  async getBalance() {
    return this.request('/api/wallet/balance');
  }

  async getTransactionHistory() {
    return this.request('/api/wallet/history');
  }

  // Transaction methods
  async initiateTransaction(recipientId, amount, description = '') {
    return this.request('/api/transactions/send', {
      method: 'POST',
      body: { recipientId, amount, description },
    });
  }

  async confirmTransaction(transactionId, otp) {
    return this.request('/api/transactions/confirm', {
      method: 'POST',
      body: { transactionId, otp },
    });
  }

  // BLE methods
  async registerMerchant(merchantData) {
    return this.request('/api/ble/register', {
      method: 'POST',
      body: merchantData,
    });
  }

  async discoverMerchants() {
    return this.request('/api/ble/discover');
  }

  // Utility methods
  async logout() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  }

  isAuthenticated() {
    return !!this.token;
  }

  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService;
