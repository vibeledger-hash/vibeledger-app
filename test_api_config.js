// Quick test for the updated API configuration
const { CONFIG } = require('./src/config');

console.log('🧪 Testing VibeLedger API Configuration');
console.log('🌐 API Base URL:', CONFIG.API_BASE_URL);
console.log('📱 OTP Length:', CONFIG.OTP_LENGTH);

// Test the deployed backend
const testAPI = async () => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();
    console.log('✅ Backend Health Check:', data);
    
    // Test OTP endpoint
    const otpResponse = await fetch(`${CONFIG.API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '+919876543210' })
    });
    
    const otpData = await otpResponse.json();
    console.log('✅ OTP Endpoint Test:', otpData);
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
};

testAPI();
