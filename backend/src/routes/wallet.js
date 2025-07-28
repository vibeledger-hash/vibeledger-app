const express = require('express');
const Joi = require('joi');
const { validate, validateQuery } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const walletService = require('../services/walletService');
const { Transaction, Merchant, User } = require('../models');
const { Op, fn, col } = require('sequelize');
const otpService = require('../services/otpService');

const router = express.Router();

// All wallet routes require authentication
router.use(authenticateToken);

// Validation schemas
const transactionHistoryQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  status: Joi.string().valid('pending', 'confirmed', 'failed', 'cancelled', 'synced'),
  type: Joi.string().valid('payment', 'refund', 'topup'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

// GET /api/wallet/balance
router.get('/balance', async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        balance: parseFloat(wallet.balance),
        currency: wallet.currency,
        isLocked: wallet.isLocked,
        dailyLimit: parseFloat(wallet.dailyLimit),
        lastTransactionAt: wallet.lastTransactionAt,
        wallet: {
          id: wallet.id,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/wallet/history
router.get('/history', validateQuery(transactionHistoryQuerySchema), async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status, type, startDate, endDate } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }
    
    const history = await walletService.getTransactionHistory(
      req.user.id,
      parseInt(limit) || 50,
      parseInt(offset) || 0,
      filters
    );
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/wallet/info
router.get('/info', async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.id);
    
    // Calculate comprehensive statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [
      dailySpent,
      weeklySpent,
      monthlySpent,
      totalTransactions,
      pendingTransactions,
      confirmedTransactions,
      failedTransactions,
      totalSpent,
      averageTransaction,
      lastFiveTransactions
    ] = await Promise.all([
      // Daily spending
      Transaction.sum('amount', {
        where: {
          userId: req.user.id,
          status: 'confirmed',
          type: 'payment',
          createdAt: { [Op.gte]: today }
        }
      }),
      // Weekly spending
      Transaction.sum('amount', {
        where: {
          userId: req.user.id,
          status: 'confirmed',
          type: 'payment',
          createdAt: { [Op.gte]: thisWeekStart }
        }
      }),
      // Monthly spending
      Transaction.sum('amount', {
        where: {
          userId: req.user.id,
          status: 'confirmed',
          type: 'payment',
          createdAt: { [Op.gte]: thisMonthStart }
        }
      }),
      // Total transactions
      Transaction.count({
        where: { userId: req.user.id }
      }),
      // Pending transactions
      Transaction.count({
        where: { 
          userId: req.user.id,
          status: 'pending'
        }
      }),
      // Confirmed transactions
      Transaction.count({
        where: { 
          userId: req.user.id,
          status: 'confirmed'
        }
      }),
      // Failed transactions
      Transaction.count({
        where: { 
          userId: req.user.id,
          status: 'failed'
        }
      }),
      // Total amount spent
      Transaction.sum('amount', {
        where: {
          userId: req.user.id,
          status: 'confirmed',
          type: 'payment'
        }
      }),
      // Average transaction amount
      Transaction.findAll({
        attributes: [
          [require('sequelize').fn('AVG', require('sequelize').col('amount')), 'average']
        ],
        where: {
          userId: req.user.id,
          status: 'confirmed'
        },
        raw: true
      }),
      // Last 5 transactions
      Transaction.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{
          model: require('../models').Merchant,
          as: 'merchant',
          attributes: ['name', 'category']
        }]
      })
    ]);
    
    // Calculate health metrics
    const remainingDailyLimit = parseFloat(wallet.dailyLimit) - parseFloat(dailySpent || 0);
    const spendingVelocity = parseFloat(dailySpent || 0) / parseFloat(wallet.dailyLimit) * 100;
    const trustLevel = wallet.user?.trustScore >= 0.9 ? 'high' : wallet.user?.trustScore >= 0.7 ? 'medium' : 'low';
    
    res.status(200).json({
      success: true,
      data: {
        wallet: {
          id: wallet.id,
          balance: parseFloat(wallet.balance),
          currency: wallet.currency,
          isLocked: wallet.isLocked,
          dailyLimit: parseFloat(wallet.dailyLimit),
          lastTransactionAt: wallet.lastTransactionAt,
          createdAt: wallet.createdAt
        },
        statistics: {
          // Spending analytics
          dailySpent: parseFloat(dailySpent || 0),
          weeklySpent: parseFloat(weeklySpent || 0),
          monthlySpent: parseFloat(monthlySpent || 0),
          totalSpent: parseFloat(totalSpent || 0),
          averageTransaction: parseFloat(averageTransaction[0]?.average || 0),
          
          // Transaction counts
          totalTransactions,
          confirmedTransactions,
          pendingTransactions,
          failedTransactions,
          
          // Health metrics
          remainingDailyLimit,
          spendingVelocity: Math.round(spendingVelocity * 100) / 100,
          trustLevel,
          
          // Recent activity
          recentTransactions: lastFiveTransactions.map(tx => ({
            id: tx.id,
            amount: parseFloat(tx.amount),
            merchantName: tx.merchant?.name || 'Unknown',
            category: tx.merchant?.category || 'Other',
            status: tx.status,
            createdAt: tx.createdAt
          }))
        },
        user: wallet.user
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/lock
const lockValidationSchema = Joi.object({
  reason: Joi.string().max(500).default('Manual lock'),
  duration: Joi.number().integer().min(1).max(1440).optional(), // minutes, max 24 hours
  requireOTP: Joi.boolean().default(false)
});

router.post('/lock', validate(lockValidationSchema), async (req, res, next) => {
  try {
    const { reason, duration, requireOTP } = req.body;
    
    // If OTP required, generate and send OTP
    if (requireOTP) {
      const otpService = require('../services/otpService');
      await otpService.generateOTP(req.user.id, 'wallet_lock', {
        reason,
        duration,
        walletId: req.user.walletId
      });
      
      return res.status(200).json({
        success: true,
        message: 'OTP sent for wallet lock confirmation',
        requiresOTP: true
      });
    }
    
    const wallet = await walletService.lockWallet(req.user.id, reason, duration);
    
    res.status(200).json({
      success: true,
      message: 'Wallet locked successfully',
      data: {
        isLocked: wallet.isLocked,
        lockedAt: new Date(),
        reason,
        ...(duration && { unlockAt: new Date(Date.now() + duration * 60000) })
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/unlock
const unlockValidationSchema = Joi.object({
  otpCode: Joi.string().length(6).optional(),
  emergencyCode: Joi.string().min(8).optional()
});

router.post('/unlock', validate(unlockValidationSchema), async (req, res, next) => {
  try {
    const { otpCode, emergencyCode } = req.body;
    
    // If OTP provided, verify it
    if (otpCode) {
      const otpService = require('../services/otpService');
      const isValid = await otpService.verifyOTP(req.user.id, otpCode, 'wallet_unlock');
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired OTP'
        });
      }
    }
    
    const wallet = await walletService.unlockWallet(req.user.id, emergencyCode);
    
    res.status(200).json({
      success: true,
      message: 'Wallet unlocked successfully',
      data: {
        isLocked: wallet.isLocked,
        unlockedAt: new Date(),
        unlockedBy: otpCode ? 'otp' : emergencyCode ? 'emergency' : 'standard'
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/set-limit
const setLimitSchema = Joi.object({
  dailyLimit: Joi.number().min(0).max(10000).required(),
  otpCode: Joi.string().length(6).required()
});

router.post('/set-limit', validate(setLimitSchema), async (req, res, next) => {
  try {
    const { dailyLimit, otpCode } = req.body;
    
    // Verify OTP for security
    const otpService = require('../services/otpService');
    const isValid = await otpService.verifyOTP(req.user.id, otpCode, 'wallet_limit');
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }
    
    const wallet = await walletService.updateDailyLimit(req.user.id, dailyLimit);
    
    res.status(200).json({
      success: true,
      message: 'Daily limit updated successfully',
      data: {
        previousLimit: wallet.previousDailyLimit,
        newLimit: parseFloat(wallet.dailyLimit),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/request-limit-otp
router.post('/request-limit-otp', async (req, res, next) => {
  try {
    const otpService = require('../services/otpService');
    await otpService.generateOTP(req.user.id, 'wallet_limit');
    
    res.status(200).json({
      success: true,
      message: 'OTP sent for daily limit change'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/wallet/analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    
    // Get spending by category
    const categorySpending = await Transaction.findAll({
      attributes: [
        [fn('SUM', col('Transaction.amount')), 'totalAmount'],
        [fn('COUNT', col('Transaction.id')), 'transactionCount']
      ],
      include: [{
        model: Merchant,
        as: 'merchant',
        attributes: ['category']
      }],
      where: {
        userId: req.user.id,
        status: 'confirmed',
        type: 'payment',
        createdAt: { [Op.gte]: startDate }
      },
      group: ['merchant.category'],
      order: [[fn('SUM', col('Transaction.amount')), 'DESC']],
      raw: true
    });    // Get daily spending trend
    const dailySpending = await Transaction.findAll({
      attributes: [
        [fn('DATE', col('Transaction.createdAt')), 'date'],
        [fn('SUM', col('Transaction.amount')), 'totalAmount'],
        [fn('COUNT', col('Transaction.id')), 'transactionCount']
      ],
      where: {
        userId: req.user.id,
        status: 'confirmed',
        type: 'payment',
        createdAt: { [Op.gte]: startDate }
      },
      group: [fn('DATE', col('Transaction.createdAt'))],
      order: [[fn('DATE', col('Transaction.createdAt')), 'ASC']],
      raw: true
    });
    
    // Get merchant frequency
    const merchantFrequency = await Transaction.findAll({
      attributes: [
        'merchantId',
        [fn('COUNT', col('Transaction.id')), 'transactionCount'],
        [fn('SUM', col('Transaction.amount')), 'totalSpent']
      ],
      include: [{
        model: Merchant,
        as: 'merchant',
        attributes: ['name', 'category', 'location']
      }],
      where: {
        userId: req.user.id,
        status: 'confirmed',
        type: 'payment',
        createdAt: { [Op.gte]: startDate }
      },
      group: ['Transaction.merchantId', 'merchant.id'],
      order: [[fn('COUNT', col('Transaction.id')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    res.status(200).json({
      success: true,
      data: {
        period: periodDays,
        categoryBreakdown: categorySpending.map(item => ({
          category: item['merchant.category'],
          totalAmount: parseFloat(item.totalAmount),
          transactionCount: parseInt(item.transactionCount),
          percentage: 0 // Will be calculated on frontend
        })),
        dailyTrend: dailySpending.map(item => ({
          date: item.date,
          totalAmount: parseFloat(item.totalAmount),
          transactionCount: parseInt(item.transactionCount)
        })),
        topMerchants: merchantFrequency.map(item => ({
          name: item['merchant.name'],
          category: item['merchant.category'],
          visitCount: parseInt(item.transactionCount),
          totalSpent: parseFloat(item.totalSpent)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/emergency-freeze
router.post('/emergency-freeze', async (req, res, next) => {
  try {
    const { reason = 'Emergency freeze initiated by user' } = req.body;
    
    // Immediately lock wallet with emergency flag
    const wallet = await walletService.emergencyLock(req.user.id, reason);
    
    // Log emergency action (simplified for now)
    console.log(`🚨 EMERGENCY FREEZE: User ${req.user.id} - ${reason}`);
    
    res.status(200).json({
      success: true,
      message: 'Wallet emergency freeze activated',
      data: {
        isLocked: true,
        emergencyMode: true,
        freezeReason: reason,
        freezeTime: new Date(),
        contactSupport: '+1-800-MICROSHIELD'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
