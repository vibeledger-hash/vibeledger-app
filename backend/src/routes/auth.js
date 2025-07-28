const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const { validate } = require('../middleware/validation');
const otpService = require('../services/otpService');
const jwtService = require('../services/jwtService');

const router = express.Router();

// Validation schemas
const requestOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{9,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be valid international format'
    }),
  purpose: Joi.string()
    .valid('login', 'transaction', 'registration')
    .default('login')
});

const verifyOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{9,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be valid international format'
    }),
  otpCode: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    }),
  purpose: Joi.string()
    .valid('login', 'transaction', 'registration')
    .default('login')
});

// POST /api/auth/request-otp
router.post('/request-otp', validate(requestOTPSchema), async (req, res, next) => {
  try {
    const { phoneNumber, purpose } = req.body;
    
    const result = await otpService.sendOTP(phoneNumber, purpose);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        otpId: result.otpId,
        expiresAt: result.expiresAt,
        phoneNumber
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', validate(verifyOTPSchema), async (req, res, next) => {
  try {
    const { phoneNumber, otpCode, purpose } = req.body;
    
    const user = await otpService.verifyOTP(phoneNumber, otpCode, purpose);
    
    // Generate JWT tokens
    const accessToken = jwtService.generateAccessToken(user);
    const refreshToken = jwtService.generateRefreshToken(user);
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.userId,
          phoneNumber: user.phoneNumber,
          trustScore: user.trustScore
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresAt: jwtService.getTokenExpiry(accessToken)
        }
      }
    });
  } catch (error) {
    // Custom error handling for auth
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (error.message.includes('Invalid or expired')) {
      return res.status(400).json({
        error: 'Invalid or expired OTP',
        code: 'INVALID_OTP'
      });
    }
    
    if (error.message.includes('Maximum OTP attempts')) {
      return res.status(429).json({
        error: 'Maximum OTP attempts exceeded',
        code: 'MAX_ATTEMPTS_EXCEEDED'
      });
    }
    
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }
    
    const decoded = jwtService.verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Generate new access token
    const newAccessToken = jwtService.generateAccessToken({
      id: decoded.userId,
      phoneNumber: decoded.phoneNumber
    });
    
    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresAt: jwtService.getTokenExpiry(newAccessToken)
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    next(error);
  }
});

module.exports = router;
