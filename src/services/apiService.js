// API Service: Handles all backend API requests
import axios from 'axios';
import { getToken } from './jwtService';

// Backend API configuration
const API_CONFIG = {
  baseURL: __DEV__ 
    ? 'http://localhost:3000/api'  // Development
    : 'https://vibeledger-app.onrender.com/api', // Production - LIVE!
  timeout: 10000,
};

const api = axios.create(API_CONFIG);

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      console.log('Token expired, redirecting to login...');
      // You can trigger logout or token refresh here
    }
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;
