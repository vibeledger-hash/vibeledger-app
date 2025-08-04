// SMS Configuration Management
const dotenv = require('dotenv');
dotenv.config();

class SMSConfig {
  constructor() {
    this.mode = this.determineSMSMode();
    this.providers = this.getAvailableProviders();
  }

  determineSMSMode() {
    // Check if any real SMS provider is configured
    const hasTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    const hasAWS = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    const hasTextLocal = process.env.TEXTLOCAL_API_KEY;
    
    if (hasTwilio || hasAWS || hasTextLocal) {
      return 'production';
    }
    
    return 'demo';
  }

  getAvailableProviders() {
    const providers = [];
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      providers.push('twilio');
    }
    
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      providers.push('aws');
    }
    
    if (process.env.TEXTLOCAL_API_KEY) {
      providers.push('textlocal');
    }
    
    if (providers.length === 0) {
      providers.push('demo');
    }
    
    return providers;
  }

  isRealSMSEnabled() {
    return this.mode === 'production';
  }

  getConfigSummary() {
    return {
      mode: this.mode,
      providers: this.providers,
      isRealSMS: this.isRealSMSEnabled(),
      message: this.isRealSMSEnabled() 
        ? `✅ Real SMS enabled with providers: ${this.providers.join(', ')}`
        : '⚠️ SMS fallback mode - configure SMS providers to enable real SMS'
    };
  }
}

module.exports = new SMSConfig();
