const speakeasy = require('speakeasy');
const twilio = require('twilio');
const firestoreService = require('./firestoreService');

class OTPService {
  constructor() {
    // Only initialize Twilio if credentials are properly configured
    if (process.env.TWILIO_ACCOUNT_SID && 
        process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      console.warn('⚠️  Twilio credentials not configured - SMS sending will be disabled');
      this.twilioClient = null;
    }
    this.expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
  }

  generateOTP() {
    return speakeasy.totp({
      secret: process.env.JWT_SECRET,
      encoding: 'base32',
      digits: 6,
      step: this.expiryMinutes * 60,
      window: 1
    });
  }

  async sendOTP(phoneNumber, purpose = 'login', metadata = null) {
    try {
      // Find or create user
      let user = await firestoreService.getUserByPhone(phoneNumber);
      if (!user && purpose === 'registration') {
        user = await firestoreService.createUser({ phoneNumber });
      }
      
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new OTP
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.expiryMinutes * 60 * 1000);

      // Save OTP to Firestore
      await firestoreService.storeOTP(phoneNumber, otpCode, expiresAt);

      // Send SMS
      if (process.env.NODE_ENV !== 'test') {
        if (this.twilioClient) {
          await this.twilioClient.messages.create({
            body: `Your MicroShield verification code is: ${otpCode}. Valid for ${this.expiryMinutes} minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
          });
        } else {
          console.log(`📱 SMS would be sent to ${phoneNumber}: Your MicroShield verification code is: ${otpCode}`);
        }
      }

      return {
        otpId: otp.id,
        expiresAt,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('OTP sending error:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOTP(phoneNumber, otpCode, purpose = 'login') {
    try {
      const user = await firestoreService.getUserByPhone(phoneNumber);
      if (!user) {
        throw new Error('User not found');
      }

      const isValid = await firestoreService.verifyOTP(phoneNumber, otpCode);

      if (!isValid) {
        throw new Error('Invalid or expired OTP');
      }

      // Update user last login
      await firestoreService.updateUser(user.id, { lastLoginAt: new Date() });

      return {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        trustScore: user.trustScore,
        verified: true
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  async cleanupExpiredOTPs() {
    try {
      const result = await OTP.destroy({
        where: {
          expiresAt: { [require('sequelize').Op.lt]: new Date() }
        }
      });
      console.log(`Cleaned up ${result} expired OTPs`);
      return result;
    } catch (error) {
      console.error('OTP cleanup error:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();
