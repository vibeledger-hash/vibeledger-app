const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { sequelize, Transaction, Merchant, Wallet } = require('../models');
const walletService = require('../services/walletService');
const otpService = require('../services/otpService');

const router = express.Router();

// All transaction routes require authentication
router.use(authenticateToken);

// Validation schemas
const initiateTransactionSchema = Joi.object({
  merchantId: Joi.string().uuid().required(),
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().max(255).optional(),
  metadata: Joi.object().optional()
});

const confirmTransactionSchema = Joi.object({
  transactionId: Joi.string().uuid().required(),
  otpCode: Joi.string().length(6).pattern(/^\d{6}$/).required()
});

const syncTransactionSchema = Joi.object({
  transactions: Joi.array().items(
    Joi.object({
      uuid: Joi.string().uuid().required(),
      merchantId: Joi.string().uuid().required(),
      amount: Joi.number().positive().precision(2).required(),
      createdAt: Joi.date().iso().required(),
      description: Joi.string().max(255).optional(),
      metadata: Joi.object().optional()
    })
  ).required()
});

// POST /api/transaction/initiate
router.post('/initiate', validate(initiateTransactionSchema), async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { merchantId, amount, description, metadata } = req.body;
    
    // Verify merchant exists
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant || !merchant.isActive) {
      return res.status(404).json({
        error: 'Merchant not found or inactive',
        code: 'MERCHANT_NOT_FOUND'
      });
    }
    
    // Check wallet exists and is not locked
    const wallet = await walletService.getWalletByUserId(req.user.id);
    if (wallet.isLocked) {
      return res.status(423).json({
        error: 'Wallet is locked',
        code: 'WALLET_LOCKED'
      });
    }
    
    // Check sufficient balance
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({
        error: 'Insufficient funds',
        code: 'INSUFFICIENT_FUNDS'
      });
    }
    
    // Check daily limit
    await walletService.checkDailyLimit(req.user.id, amount);
    
    // Create pending transaction
    const transaction = await Transaction.create({
      uuid: uuidv4(),
      userId: req.user.id,
      merchantId,
      amount,
      description,
      metadata: {
        ...metadata,
        initiatedBy: 'user',
        initiatedAt: new Date()
      },
      status: 'pending'
    }, { transaction: t });
    
    // Send OTP for transaction confirmation
    await otpService.sendOTP(
      req.user.phoneNumber, 
      'transaction',
      { transactionId: transaction.id }
    );
    
    await t.commit();
    
    res.status(201).json({
      success: true,
      message: 'Transaction initiated. OTP sent for confirmation.',
      data: {
        transaction: {
          id: transaction.id,
          uuid: transaction.uuid,
          amount: parseFloat(transaction.amount),
          status: transaction.status,
          createdAt: transaction.createdAt
        },
        merchant: {
          id: merchant.id,
          name: merchant.name,
          category: merchant.category
        },
        otpSent: true
      }
    });
  } catch (error) {
    await t.rollback();
    
    if (error.message.includes('Daily limit exceeded')) {
      return res.status(400).json({
        error: error.message,
        code: 'DAILY_LIMIT_EXCEEDED'
      });
    }
    
    next(error);
  }
});

// POST /api/transaction/confirm
router.post('/confirm', validate(confirmTransactionSchema), async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { transactionId, otpCode } = req.body;
    
    // Find pending transaction
    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        userId: req.user.id,
        status: 'pending'
      },
      include: [{
        model: Merchant,
        as: 'merchant',
        attributes: ['id', 'name', 'category']
      }],
      transaction: t
    });
    
    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found or already processed',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }
    
    // Verify OTP
    try {
      await otpService.verifyOTP(req.user.phoneNumber, otpCode, 'transaction');
    } catch (otpError) {
      return res.status(400).json({
        error: 'Invalid OTP',
        code: 'INVALID_OTP'
      });
    }
    
    // Update wallet balance
    await walletService.updateBalance(
      req.user.id, 
      -parseFloat(transaction.amount),
      t
    );
    
    // Confirm transaction
    await transaction.update({
      status: 'confirmed',
      confirmedAt: new Date(),
      metadata: {
        ...transaction.metadata,
        confirmedBy: 'otp',
        confirmedAt: new Date()
      }
    }, { transaction: t });
    
    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Transaction confirmed successfully',
      data: {
        transaction: {
          id: transaction.id,
          uuid: transaction.uuid,
          amount: parseFloat(transaction.amount),
          status: transaction.status,
          confirmedAt: transaction.confirmedAt,
          createdAt: transaction.createdAt
        },
        merchant: transaction.merchant
      }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// POST /api/transaction/sync
router.post('/sync', validate(syncTransactionSchema), async (req, res, next) => {
  try {
    const { transactions } = req.body;
    const results = [];
    
    for (const txData of transactions) {
      const t = await sequelize.transaction();
      
      try {
        // Check if transaction already exists
        const existing = await Transaction.findOne({
          where: { uuid: txData.uuid }
        });
        
        if (existing) {
          results.push({
            uuid: txData.uuid,
            status: 'duplicate',
            message: 'Transaction already exists'
          });
          await t.rollback();
          continue;
        }
        
        // Verify merchant
        const merchant = await Merchant.findByPk(txData.merchantId);
        if (!merchant) {
          results.push({
            uuid: txData.uuid,
            status: 'failed',
            message: 'Merchant not found'
          });
          await t.rollback();
          continue;
        }
        
        // Create synced transaction
        const transaction = await Transaction.create({
          uuid: txData.uuid,
          userId: req.user.id,
          merchantId: txData.merchantId,
          amount: txData.amount,
          description: txData.description,
          metadata: {
            ...txData.metadata,
            syncedFrom: 'offline',
            originalCreatedAt: txData.createdAt
          },
          status: 'synced',
          createdAt: new Date(txData.createdAt),
          syncedAt: new Date()
        }, { transaction: t });
        
        // Update wallet balance
        await walletService.updateBalance(
          req.user.id,
          -parseFloat(txData.amount),
          t
        );
        
        await t.commit();
        
        results.push({
          uuid: txData.uuid,
          status: 'synced',
          transactionId: transaction.id,
          message: 'Successfully synced'
        });
      } catch (error) {
        await t.rollback();
        
        results.push({
          uuid: txData.uuid,
          status: 'failed',
          message: error.message
        });
      }
    }
    
    const successful = results.filter(r => r.status === 'synced').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const duplicates = results.filter(r => r.status === 'duplicate').length;
    
    res.status(200).json({
      success: true,
      message: `Sync completed: ${successful} synced, ${failed} failed, ${duplicates} duplicates`,
      data: {
        summary: {
          total: transactions.length,
          successful,
          failed,
          duplicates
        },
        results
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transaction/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findOne({
      where: {
        id,
        userId: req.user.id
      },
      include: [{
        model: Merchant,
        as: 'merchant',
        attributes: ['id', 'name', 'category', 'location']
      }]
    });
    
    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          uuid: transaction.uuid,
          amount: parseFloat(transaction.amount),
          currency: transaction.currency,
          status: transaction.status,
          type: transaction.type,
          description: transaction.description,
          metadata: transaction.metadata,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          confirmedAt: transaction.confirmedAt,
          syncedAt: transaction.syncedAt
        },
        merchant: transaction.merchant
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
