const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const realTimeConfig = require('./config/realtime-config');

// Import services
const smsService = require('./services/sms');
const otpService = require('./services/otp');
const smsConfig = require('./config/sms-config');

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

// System configuration endpoint
app.get('/api/system/config', (req, res) => {
  try {
    const smsConfig = realTimeConfig.getSMSConfig();
    const otpConfig = realTimeConfig.getOTPConfig();
    const features = realTimeConfig.getFeatureFlags();
    
    res.json({
      smsProvider: smsConfig.provider,
      smsEnabled: features.enableRealTimeSMS,
      otpLength: otpConfig.length,
      environment: realTimeConfig.getEnvironment(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Error getting system config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Real OTP Authentication Routes
app.post('/api/auth/request-otp', async (req, res) => {
  try {
    const { phoneNumber, purpose } = req.body;
    
    // Validate phone number
    if (!phoneNumber || !/^\+?[1-9]\d{9,14}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    // Check rate limiting
    const rateLimitCheck = otpService.canRequestOTP(phoneNumber);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: rateLimitCheck.reason,
        waitTime: rateLimitCheck.waitTime
      });
    }

    // Generate OTP and ID
    const otp = otpService.generateOTP();
    const otpId = otpService.generateOTPId();
    
    // Store OTP
    otpService.storeOTP(otpId, phoneNumber, otp);
    
    // Send SMS
    const smsResult = await smsService.sendOTP(phoneNumber, otp);
    
    if (smsResult.success) {
      console.log(`✅ OTP sent successfully: ${otpId} to ${phoneNumber}`);
      
      res.json({
        success: true,
        message: smsResult.message,
        otpId: otpId,
        expiresIn: 300, // 5 minutes
        phoneNumber: phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // Mask phone number
        provider: smsResult.provider,
        ...(smsResult.demoOTP && { demoOTP: smsResult.demoOTP }) // Only in demo mode
      });
    } else {
      throw new Error('Failed to send SMS');
    }
    
  } catch (error) {
    console.error('❌ OTP request failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send OTP'
    });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { otpId, otp, phoneNumber } = req.body;

    // Validate input
    if (!otpId || !otp || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: otpId, otp, phoneNumber'
      });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'OTP must be exactly 6 digits'
      });
    }

    // Verify OTP
    const otpData = otpService.verifyOTP(otpId, otp, phoneNumber);
    
    // Generate JWT token (mock for now)
    const token = `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ OTP verification successful for ${phoneNumber}`);
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      token: token,
      expiresIn: 24 * 60 * 60, // 24 hours
      user: {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber: phoneNumber,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
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

const PORT = realTimeConfig.getAPIConfig().port;
const HOST = realTimeConfig.getAPIConfig().host;

app.listen(PORT, HOST, () => {
  // Print real-time configuration summary
  realTimeConfig.printSummary();
  
  console.log(`\n🚀 VibeLedger Backend Server running on ${HOST}:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Remote access: http://10.149.10.213:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
  console.log(`� Production Ready: ${realTimeConfig.isProduction() ? 'Yes' : 'No'}`);
});

module.exports = app;
