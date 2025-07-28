const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import all routes
const authRoutes = require('../src/routes/auth');
const walletRoutes = require('../src/routes/wallet');
const transactionRoutes = require('../src/routes/transaction');
const bleRoutes = require('../src/routes/ble');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'MicroShield Backend on Vercel',
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ble', bleRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MicroShield Backend API',
    endpoints: [
      'GET /health',
      'POST /api/auth/request-otp',
      'POST /api/auth/verify-otp',
      'GET /api/wallet/balance',
      'POST /api/transactions/send',
      'GET /api/ble/devices'
    ]
  });
});

module.exports = app;
