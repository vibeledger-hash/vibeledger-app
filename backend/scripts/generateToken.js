const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate a test JWT token for the seeded test user using the same method as the auth service
const generateTestToken = () => {
  const payload = {
    userId: '28980431-d075-439c-9cc0-65ca99ebe35c', // Actual seeded user ID
    phoneNumber: '+1234567890',
    trustScore: 0.95,
    type: 'access'
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'microshield-api',
    audience: 'microshield-app'
  });

  return token;
};

const testToken = generateTestToken();

console.log('🔑 Test JWT Token Generated');
console.log('===========================');
console.log('Token:', testToken);
console.log('');
console.log('📱 Use this token for testing authenticated endpoints:');
console.log('');
console.log('curl -H "Authorization: Bearer ' + testToken + '" \\');
console.log('     http://localhost:3000/api/wallet/balance');
console.log('');
console.log('⏰ Token expires in 24 hours');
console.log('👤 User: +1234567890 (Test user with $1000 balance)');

module.exports = { generateTestToken };
