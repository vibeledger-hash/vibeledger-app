// OTP Management Service
// Handles OTP generation, storage, and verification

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis or database
    this.maxAttempts = 3;
    this.otpExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Cleanup expired OTPs every minute
    setInterval(() => this.cleanupExpiredOTPs(), 60000);
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateOTPId() {
    return `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  storeOTP(otpId, phoneNumber, otp) {
    const otpData = {
      phoneNumber,
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.otpExpiry,
      attempts: 0,
      verified: false
    };

    this.otpStore.set(otpId, otpData);
    console.log(`🔐 OTP stored: ${otpId} for ${phoneNumber}`);
    
    return otpData;
  }

  verifyOTP(otpId, providedOTP, phoneNumber) {
    const otpData = this.otpStore.get(otpId);
    
    if (!otpData) {
      throw new Error('Invalid or expired OTP ID');
    }

    if (otpData.phoneNumber !== phoneNumber) {
      throw new Error('Phone number mismatch');
    }

    if (otpData.verified) {
      throw new Error('OTP already used');
    }

    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(otpId);
      throw new Error('OTP has expired');
    }

    if (otpData.attempts >= this.maxAttempts) {
      this.otpStore.delete(otpId);
      throw new Error('Maximum verification attempts exceeded');
    }

    // Increment attempt counter
    otpData.attempts++;

    if (otpData.otp !== providedOTP) {
      this.otpStore.set(otpId, otpData);
      throw new Error(`Invalid OTP. ${this.maxAttempts - otpData.attempts} attempts remaining`);
    }

    // OTP is valid
    otpData.verified = true;
    otpData.verifiedAt = Date.now();
    this.otpStore.set(otpId, otpData);

    console.log(`✅ OTP verified successfully: ${otpId}`);
    return otpData;
  }

  getOTPInfo(otpId) {
    const otpData = this.otpStore.get(otpId);
    if (!otpData) return null;

    return {
      phoneNumber: otpData.phoneNumber,
      createdAt: otpData.createdAt,
      expiresAt: otpData.expiresAt,
      attempts: otpData.attempts,
      verified: otpData.verified,
      timeRemaining: Math.max(0, otpData.expiresAt - Date.now())
    };
  }

  cleanupExpiredOTPs() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [otpId, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(otpId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
    }
  }

  // Rate limiting for OTP requests
  canRequestOTP(phoneNumber) {
    const recentOTPs = Array.from(this.otpStore.values())
      .filter(otpData => 
        otpData.phoneNumber === phoneNumber && 
        (Date.now() - otpData.createdAt) < 60000 // Within last minute
      );

    if (recentOTPs.length >= 2) { // Max 2 OTPs per minute
      return {
        allowed: false,
        reason: 'Rate limit exceeded. Please wait before requesting another OTP.',
        waitTime: 60000 - (Date.now() - recentOTPs[0].createdAt)
      };
    }

    return { allowed: true };
  }

  getStats() {
    return {
      totalOTPs: this.otpStore.size,
      verifiedOTPs: Array.from(this.otpStore.values()).filter(otp => otp.verified).length,
      expiredOTPs: Array.from(this.otpStore.values()).filter(otp => Date.now() > otp.expiresAt).length
    };
  }
}

module.exports = new OTPService();
