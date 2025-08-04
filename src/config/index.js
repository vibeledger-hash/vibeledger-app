// Configuration for VibeLedger App
export const CONFIG = {
  // API Configuration
  API_BASE_URL: __DEV__ 
    ? 'http://10.149.10.213:3000'  // Your computer's IP for physical device
    : 'https://your-production-backend.com', // Production URL
  
  // For Android emulator, use: 'http://10.0.2.2:3000'
  // For iOS simulator, use: 'http://localhost:3000'
  // For physical device, use your computer's IP: 'http://192.168.1.xxx:3000'
  
  // App Configuration
  APP_NAME: 'VibeLedger Merchant',
  VERSION: '1.0.0',
  
  // OTP Configuration
  OTP_LENGTH: 6,
  OTP_TIMEOUT: 300000, // 5 minutes in milliseconds
  
  // Transaction Configuration
  MIN_TRANSACTION_AMOUNT: 1,
  MAX_TRANSACTION_AMOUNT: 100000,
  CURRENCY: '₹',
  CURRENCY_CODE: 'INR',
  
  // Demo Mode - Set to false for production
  DEMO_MODE: false,
  
  // Network timeout
  NETWORK_TIMEOUT: 10000, // 10 seconds
};
