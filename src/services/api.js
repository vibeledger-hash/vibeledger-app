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
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      console.log('📦 Request body:', config.body);
      console.log('🔑 Headers:', JSON.stringify(config.headers, null, 2));
      
      // Create a promise with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
      );
      
      const fetchPromise = fetch(url, config);
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log(`✅ Response Status: ${response.status} ${response.statusText}`);
      console.log('📄 Response Headers:', JSON.stringify([...response.headers.entries()], null, 2));
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('⚠️ Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      console.log('📦 API Response Data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      console.error('🔍 Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Enhanced error handling
      if (error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to reach server. Please check if the backend is running.');
      } else if (error.message.includes('JSON')) {
        throw new Error('Server response format error. Please contact support.');
      }
      
      throw error;
    }
  }

  // Authentication methods
  async requestOTP(phoneNumber) {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: { phoneNumber, purpose: 'login' },
    });
  }

  async verifyOTP(otpId, otp, phoneNumber) {
    const response = await this.request('/auth/verify-otp', {
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
    return this.request('/wallet/balance');
  }

  async getTransactionHistory() {
    return this.request('/wallet/history');
  }

  // Transaction methods
  async initiateTransaction(recipientId, amount, description = '') {
    return this.request('/transactions/send', {
      method: 'POST',
      body: { recipientId, amount, description },
    });
  }

  async confirmTransaction(transactionId, otp) {
    return this.request('/transactions/confirm', {
      method: 'POST',
      body: { transactionId, otp },
    });
  }

  // BLE methods
  async registerMerchant(merchantData) {
    return this.request('/ble/register', {
      method: 'POST',
      body: merchantData,
    });
  }

  async discoverMerchants() {
    return this.request('/ble/discover');
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
