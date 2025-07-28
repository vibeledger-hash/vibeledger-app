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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'MicroShield Backend Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock Authentication Routes
app.post('/api/auth/request-otp', (req, res) => {
  const { phoneNumber, purpose } = req.body;
  
  // Validate phone number
  if (!phoneNumber || !/^\+?[1-9]\d{9,14}$/.test(phoneNumber)) {
    return res.status(400).json({
      error: 'Invalid phone number format'
    });
  }

  // Mock OTP request
  res.json({
    success: true,
    message: 'OTP sent successfully',
    otpId: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expiresIn: 300, // 5 minutes
    phoneNumber: phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') // Mask phone number
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { otpId, otp, phoneNumber } = req.body;

  // Mock OTP verification (accept any 6-digit code)
  if (!otp || otp.length !== 6) {
    return res.status(400).json({
      error: 'Invalid OTP format'
    });
  }

  // Mock successful verification
  res.json({
    success: true,
    message: 'OTP verified successfully',
    token: `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expiresIn: 86400, // 24 hours
    user: {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber: phoneNumber,
      createdAt: new Date().toISOString()
    }
  });
});

// Mock Wallet Routes
app.get('/api/wallet/balance', (req, res) => {
  // Mock wallet balance
  res.json({
    balance: parseFloat((Math.random() * 1000).toFixed(2)),
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
    transactions: {
      pending: Math.floor(Math.random() * 5),
      completed: Math.floor(Math.random() * 50)
    }
  });
});

// Mock Transaction Routes
app.post('/api/transactions/send', (req, res) => {
  const { recipientId, amount, description } = req.body;

  if (!recipientId || !amount || amount <= 0) {
    return res.status(400).json({
      error: 'Invalid transaction parameters'
    });
  }

  // Mock transaction
  res.json({
    success: true,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: parseFloat(amount),
    recipientId,
    description: description || 'Payment',
    status: 'pending',
    estimatedCompletion: new Date(Date.now() + 30000).toISOString(), // 30 seconds
    createdAt: new Date().toISOString()
  });
});

app.get('/api/transactions/history', (req, res) => {
  // Mock transaction history
  const transactions = Array.from({ length: 10 }, (_, i) => ({
    id: `txn_${Date.now() - i * 1000}_${Math.random().toString(36).substr(2, 9)}`,
    amount: parseFloat((Math.random() * 100).toFixed(2)),
    type: Math.random() > 0.5 ? 'sent' : 'received',
    status: Math.random() > 0.2 ? 'completed' : 'pending',
    description: ['Payment', 'Refund', 'Purchase', 'Transfer'][Math.floor(Math.random() * 4)],
    createdAt: new Date(Date.now() - i * 3600000).toISOString()
  }));

  res.json({
    transactions,
    totalCount: 45,
    hasMore: true
  });
});

// Mock BLE Routes
app.get('/api/ble/devices', (req, res) => {
  // Mock BLE devices
  const devices = [
    {
      id: 'device_001',
      name: 'MicroShield Terminal #001',
      type: 'payment_terminal',
      status: 'online',
      batteryLevel: 85,
      lastSeen: new Date().toISOString(),
      capabilities: ['payment', 'balance_inquiry', 'receipt']
    },
    {
      id: 'device_002',
      name: 'MicroShield Terminal #002',
      type: 'payment_terminal',
      status: 'offline',
      batteryLevel: 23,
      lastSeen: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      capabilities: ['payment', 'balance_inquiry']
    }
  ];

  res.json({
    devices,
    totalCount: devices.length,
    onlineCount: devices.filter(d => d.status === 'online').length
  });
});

app.post('/api/ble/pair', (req, res) => {
  const { deviceId, pinCode } = req.body;

  if (!deviceId || !pinCode) {
    return res.status(400).json({
      error: 'Device ID and PIN code required'
    });
  }

  // Mock pairing
  res.json({
    success: true,
    message: 'Device paired successfully',
    deviceId,
    pairId: `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'MicroShield Payment API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        requestOTP: 'POST /api/auth/request-otp',
        verifyOTP: 'POST /api/auth/verify-otp'
      },
      wallet: {
        balance: 'GET /api/wallet/balance'
      },
      transactions: {
        send: 'POST /api/transactions/send',
        history: 'GET /api/transactions/history'
      },
      ble: {
        devices: 'GET /api/ble/devices',
        pair: 'POST /api/ble/pair'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/docs',
      'POST /api/auth/request-otp',
      'POST /api/auth/verify-otp',
      'GET /api/wallet/balance',
      'POST /api/transactions/send',
      'GET /api/transactions/history',
      'GET /api/ble/devices',
      'POST /api/ble/pair'
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MicroShield Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
