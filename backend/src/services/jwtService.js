const jwt = require('jsonwebtoken');

class JWTService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  generateToken(payload) {
    try {
      return jwt.sign(payload, this.secret, { 
        expiresIn: this.expiresIn,
        issuer: 'microshield-api',
        audience: 'microshield-app'
      });
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate token');
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'microshield-api',
        audience: 'microshield-app'
      });
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  generateAccessToken(user) {
    const payload = {
      userId: user.userId || user.id,
      phoneNumber: user.phoneNumber,
      trustScore: user.trustScore,
      type: 'access'
    };
    return this.generateToken(payload);
  }

  generateRefreshToken(user) {
    const payload = {
      userId: user.userId || user.id,
      phoneNumber: user.phoneNumber,
      type: 'refresh'
    };
    return jwt.sign(payload, this.secret, { 
      expiresIn: '7d',
      issuer: 'microshield-api',
      audience: 'microshield-app'
    });
  }

  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  getTokenExpiry(token) {
    const decoded = this.decodeToken(token);
    if (decoded && decoded.payload.exp) {
      return new Date(decoded.payload.exp * 1000);
    }
    return null;
  }

  isTokenExpired(token) {
    const expiry = this.getTokenExpiry(token);
    return expiry ? expiry < new Date() : true;
  }
}

module.exports = new JWTService();
