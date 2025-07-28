const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'MicroShield Backend Local Development Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock Auth Routes
app.post('/api/auth/request-otp', (req, res) => {
  const { phoneNumber, purpose } = req.body;
  console.log(`📱 OTP Request - Phone: ${phoneNumber}, Purpose: ${purpose}`);
  
  res.json({
    success: true,
    message: 'OTP sent successfully (MOCK)',
    sessionId: 'mock-session-' + Date.now(),
    expiresIn: 300
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { sessionId, otp, phoneNumber } = req.body;
  console.log(`🔐 OTP Verification - Session: ${sessionId}, OTP: ${otp}`);
  
  // Mock verification (accept any 6-digit OTP)
  if (otp && otp.length === 6) {
    res.json({
      success: true,
      message: 'OTP verified successfully (MOCK)',
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'user-123',
        phoneNumber: phoneNumber,
        isNewUser: false
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP format'
    });
  }
});

// Mock Wallet Routes
app.get('/api/wallet/balance', (req, res) => {
  console.log('💰 Wallet Balance Request');
  res.json({
    success: true,
    balance: {
      total: 2500.75,
      available: 2450.75,
      pending: 50.00,
      currency: 'USD'
    },
    lastUpdated: new Date().toISOString()
  });
});

// Mock Transaction Routes
app.post('/api/transactions/send', (req, res) => {
  const { amount, recipientId, description } = req.body;
  console.log(`💸 Transaction Request - Amount: ${amount}, Recipient: ${recipientId}`);
  
  res.json({
    success: true,
    transaction: {
      id: 'txn-' + Date.now(),
      amount: amount,
      recipientId: recipientId,
      description: description || 'Payment',
      status: 'completed',
      timestamp: new Date().toISOString(),
      fee: amount * 0.01 // 1% fee
    }
  });
});

app.get('/api/transactions/history', (req, res) => {
  console.log('📋 Transaction History Request');
  res.json({
    success: true,
    transactions: [
      {
        id: 'txn-001',
        type: 'sent',
        amount: 150.00,
        recipient: '+1234567890',
        description: 'Coffee payment',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        id: 'txn-002',
        type: 'received',
        amount: 75.50,
        sender: '+0987654321',
        description: 'Lunch split',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      }
    ]
  });
});

// Mock BLE Device Routes
app.get('/api/ble/devices', (req, res) => {
  console.log('📡 BLE Devices Request');
  res.json({
    success: true,
    devices: [
      {
        id: 'device-001',
        name: 'MicroShield Terminal #1',
        type: 'payment_terminal',
        status: 'available',
        batteryLevel: 85,
        lastSeen: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/ble/connect', (req, res) => {
  const { deviceId } = req.body;
  console.log(`🔗 BLE Connect Request - Device: ${deviceId}`);
  
  res.json({
    success: true,
    message: 'Connected to device successfully (MOCK)',
    deviceId: deviceId,
    connectionId: 'conn-' + Date.now()
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'MicroShield Backend API',
    version: '1.0.0',
    environment: 'local-development',
    endpoints: {
      auth: [
        'POST /api/auth/request-otp',
        'POST /api/auth/verify-otp'
      ],
      wallet: [
        'GET /api/wallet/balance'
      ],
      transactions: [
        'POST /api/transactions/send',
        'GET /api/transactions/history'
      ],
      ble: [
        'GET /api/ble/devices',
        'POST /api/ble/connect'
      ]
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    availableEndpoints: '/api'
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('\n🚀 MicroShield Backend Development Server');
  console.log('==========================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📋 API documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('🧪 Test endpoints:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log(`   curl http://localhost:${PORT}/api`);
  console.log('');
  console.log('🎯 Ready for React Native frontend integration!');
  console.log('==========================================\n');
});

module.exports = app;
