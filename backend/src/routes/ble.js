const express = require('express');
const Joi = require('joi');
const { validate, validateQuery } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { Merchant } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Validation schemas
const registerMerchantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  bleId: Joi.string().optional(),
  qrCode: Joi.string().optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    address: Joi.string().max(255)
  }).optional(),
  category: Joi.string().max(50).optional(),
  contactInfo: Joi.object({
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    website: Joi.string().uri().optional()
  }).optional()
});

const discoverQuerySchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(0.1).max(50).default(5), // km
  category: Joi.string().max(50).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// POST /api/ble/register - Register a new merchant
router.post('/register', validate(registerMerchantSchema), async (req, res, next) => {
  try {
    const {
      name,
      bleId,
      qrCode,
      location,
      category,
      contactInfo
    } = req.body;
    
    // Check for duplicate BLE ID or QR code
    const existingMerchant = await Merchant.findOne({
      where: {
        [Op.or]: [
          ...(bleId ? [{ bleId }] : []),
          ...(qrCode ? [{ qrCode }] : [])
        ]
      }
    });
    
    if (existingMerchant) {
      return res.status(409).json({
        error: 'Merchant with this BLE ID or QR code already exists',
        code: 'MERCHANT_EXISTS'
      });
    }
    
    const merchant = await Merchant.create({
      name,
      bleId,
      qrCode,
      location,
      category,
      contactInfo
    });
    
    res.status(201).json({
      success: true,
      message: 'Merchant registered successfully',
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          bleId: merchant.bleId,
          qrCode: merchant.qrCode,
          category: merchant.category,
          isActive: merchant.isActive,
          createdAt: merchant.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ble/discover - Discover nearby merchants
router.post('/discover', authenticateToken, validate(discoverQuerySchema), async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5, category, limit = 20 } = req.body;
    
    let whereClause = {
      isActive: true
    };
    
    // Filter by category if provided
    if (category) {
      whereClause.category = category;
    }
    
    // If location is provided, add proximity filtering
    let merchants;
    if (latitude && longitude) {
      // Using basic distance calculation (for production, consider using PostGIS)
      merchants = await Merchant.findAll({
        where: whereClause,
        limit: parseInt(limit) || 20,
        order: [['trustScore', 'DESC'], ['createdAt', 'DESC']]
      });
      
      // Filter by radius (basic implementation)
      merchants = merchants.filter(merchant => {
        if (!merchant.location || !merchant.location.latitude || !merchant.location.longitude) {
          return false;
        }
        
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          merchant.location.latitude,
          merchant.location.longitude
        );
        
        return distance <= parseFloat(radius);
      });
    } else {
      merchants = await Merchant.findAll({
        where: whereClause,
        limit: parseInt(limit) || 20,
        order: [['trustScore', 'DESC'], ['createdAt', 'DESC']]
      });
    }
    
    // Add distance information
    const merchantsWithDistance = merchants.map(merchant => ({
      id: merchant.id,
      name: merchant.name,
      bleId: merchant.bleId,
      qrCode: merchant.qrCode,
      category: merchant.category,
      location: merchant.location,
      trustScore: parseFloat(merchant.trustScore),
      contactInfo: merchant.contactInfo,
      distance: (latitude && longitude && merchant.location) ? 
        calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          merchant.location.latitude,
          merchant.location.longitude
        ) : null,
      createdAt: merchant.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: {
        merchants: merchantsWithDistance,
        total: merchantsWithDistance.length,
        searchParams: {
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          radius: parseFloat(radius),
          category,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ble/merchant/:id - Get merchant details
router.get('/merchant/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const merchant = await Merchant.findOne({
      where: {
        id,
        isActive: true
      }
    });
    
    if (!merchant) {
      return res.status(404).json({
        error: 'Merchant not found',
        code: 'MERCHANT_NOT_FOUND'
      });
    }
    
    // Get recent transaction count for trust metrics
    const { Transaction } = require('../models');
    const recentTransactionCount = await Transaction.count({
      where: {
        merchantId: id,
        status: 'confirmed',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          bleId: merchant.bleId,
          qrCode: merchant.qrCode,
          category: merchant.category,
          location: merchant.location,
          trustScore: parseFloat(merchant.trustScore),
          contactInfo: merchant.contactInfo,
          isActive: merchant.isActive,
          createdAt: merchant.createdAt,
          lastTransactionAt: merchant.lastTransactionAt
        },
        metrics: {
          recentTransactionCount,
          trustLevel: getTrustLevel(merchant.trustScore)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ble/categories - Get available merchant categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Merchant.findAll({
      attributes: ['category'],
      where: {
        isActive: true,
        category: {
          [Op.not]: null
        }
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });
    
    const categoryList = categories.map(c => c.category).filter(Boolean);
    
    res.status(200).json({
      success: true,
      data: {
        categories: categoryList
      }
    });
  } catch (error) {
    next(error);
  }
});

// Validation schemas for verification
const verifyQRSchema = Joi.object({
  qrCode: Joi.string().required()
});

const verifyBLESchema = Joi.object({
  bleId: Joi.string().required()
});

// POST /api/ble/verify/qr - Verify merchant by QR code
router.post('/verify/qr', authenticateToken, validate(verifyQRSchema), async (req, res, next) => {
  try {
    const { qrCode } = req.body;
    
    const merchant = await Merchant.findOne({
      where: { 
        qrCode,
        isActive: true 
      }
    });
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found or inactive'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          category: merchant.category,
          location: merchant.location,
          trustScore: merchant.trustScore,
          trustLevel: getTrustLevel(merchant.trustScore),
          contactInfo: merchant.contactInfo,
          dailyLimit: parseFloat(merchant.dailyLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ble/verify/ble - Verify merchant by BLE ID
router.post('/verify/ble', authenticateToken, validate(verifyBLESchema), async (req, res, next) => {
  try {
    const { bleId } = req.body;
    
    const merchant = await Merchant.findOne({
      where: { 
        bleId,
        isActive: true 
      }
    });
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found or inactive'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          category: merchant.category,
          location: merchant.location,
          trustScore: merchant.trustScore,
          trustLevel: getTrustLevel(merchant.trustScore),
          contactInfo: merchant.contactInfo,
          dailyLimit: parseFloat(merchant.dailyLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 100) / 100; // Round to 2 decimal places
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function getTrustLevel(trustScore) {
  if (trustScore >= 0.8) return 'high';
  if (trustScore >= 0.6) return 'medium';
  if (trustScore >= 0.4) return 'low';
  return 'new';
}

module.exports = router;
