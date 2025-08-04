// Configuration for VibeLedger App
export const CONFIG = {
  // API Configuration - Use deployed backend with real SMS
  API_BASE_URL: 'https://vibeledger-app.onrender.com/api',
  
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
