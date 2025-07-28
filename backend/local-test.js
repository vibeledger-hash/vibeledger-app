const express = require('express');
const cors = require('cors');

// Simple local test server
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'MicroShield Backend Local Test',
    timestamp: new Date().toISOString(),
    project: 'vibe-ledger-app'
  });
});

// Mock OTP request
app.post('/api/auth/request-otp', (req, res) => {
  const { phoneNumber } = req.body;
  res.json({
    success: true,
    message: 'OTP sent successfully',
    phoneNumber: phoneNumber,
    otpId: 'test-otp-' + Date.now()
  });
});

// Mock OTP verification
app.post('/api/auth/verify-otp', (req, res) => {
  const { otpId, otp } = req.body;
  res.json({
    success: true,
    message: 'OTP verified successfully',
    token: 'mock-jwt-token-' + Date.now(),
    user: { id: 'user123', phone: req.body.phoneNumber }
  });
});

// Mock wallet balance
app.get('/api/wallet/balance', (req, res) => {
  res.json({
    balance: 150.75,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MicroShield Local Test Server running on http://localhost:${PORT}`);
  console.log(`📱 Test endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/auth/request-otp`);
  console.log(`   POST /api/auth/verify-otp`);
  console.log(`   GET  /api/wallet/balance`);
});

module.exports = app;
