// Real-Time Configuration Manager for VibeLedger
// Handles environment-specific settings and real-time feature toggles

const dotenv = require('dotenv');
const path = require('path');

class RealTimeConfig {
  constructor() {
    this.loadEnvironment();
    this.validateConfig();
  }

  loadEnvironment() {
    // Load environment-specific config
    const env = process.env.NODE_ENV || 'development';
    const envFile = env === 'production' ? '.env.prod' : '.env';
    
    dotenv.config({ path: path.join(__dirname, '..', envFile) });
    
    console.log(`🚀 Loading ${env} configuration from ${envFile}`);
  }

  validateConfig() {
    const required = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN', 
      'TWILIO_FROM_NUMBER',
      'JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`⚠️ Missing required config: ${missing.join(', ')}`);
    } else {
      console.log('✅ All required configuration validated');
    }
  }

  // SMS Configuration
  getSMSConfig() {
    return {
      provider: process.env.SMS_PROVIDER || 'demo',
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER
      },
      aws: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      },
      textLocal: {
        apiKey: process.env.TEXTLOCAL_API_KEY,
        sender: process.env.TEXTLOCAL_SENDER || 'VIBE'
      },
      rateLimiting: {
        perMinute: parseInt(process.env.SMS_RATE_LIMIT_PER_MINUTE) || 2,
        perHour: parseInt(process.env.SMS_RATE_LIMIT_PER_HOUR) || 10,
        perDay: parseInt(process.env.SMS_RATE_LIMIT_PER_DAY) || 50
      }
    };
  }

  // OTP Configuration
  getOTPConfig() {
    return {
      length: parseInt(process.env.OTP_LENGTH) || 6,
      expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,
      maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 3,
      cleanupIntervalMinutes: parseInt(process.env.OTP_CLEANUP_INTERVAL_MINUTES) || 10
    };
  }

  // Database Configuration
  getDatabaseConfig() {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'vibeledger_dev',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        max: parseInt(process.env.DB_POOL_MAX) || 10
      }
    };
  }

  // Redis Configuration (for production OTP storage)
  getRedisConfig() {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'vibeledger:'
    };
  }

  // JWT Configuration
  getJWTConfig() {
    return {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };
  }

  // API Configuration
  getAPIConfig() {
    return {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      port: parseInt(process.env.PORT) || 3000,
      host: process.env.HOST || '0.0.0.0',
      corsOrigin: process.env.CORS_ORIGIN || '*',
      rateLimiting: {
        windowMinutes: parseInt(process.env.API_RATE_LIMIT_WINDOW_MINUTES) || 15,
        maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100
      }
    };
  }

  // Feature Flags
  getFeatureFlags() {
    return {
      enableRealTimeSMS: process.env.ENABLE_REAL_TIME_SMS !== 'false',
      enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
      enableSMSTesting: process.env.ENABLE_SMS_TESTING === 'true',
      enableTestEndpoints: process.env.ENABLE_TEST_ENDPOINTS === 'true',
      enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
      enableErrorTracking: process.env.ENABLE_ERROR_TRACKING !== 'false'
    };
  }

  // Testing Configuration
  getTestingConfig() {
    return {
      phoneNumbers: (process.env.TEST_PHONE_NUMBERS || process.env.TEST_PHONE_NUMBER || '').split(',').filter(Boolean),
      debugSMS: process.env.DEBUG_SMS === 'true',
      debugOTP: process.env.DEBUG_OTP === 'true',
      debugAuth: process.env.DEBUG_AUTH === 'true'
    };
  }

  // Security Configuration
  getSecurityConfig() {
    return {
      encryptionKey: process.env.AES_ENCRYPTION_KEY,
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
      sessionSecret: process.env.SESSION_SECRET,
      trustProxy: process.env.TRUST_PROXY === 'true',
      enableHelmet: process.env.ENABLE_HELMET_SECURITY !== 'false',
      enableCompression: process.env.ENABLE_COMPRESSION !== 'false'
    };
  }

  // Get environment
  getEnvironment() {
    return process.env.NODE_ENV || 'development';
  }

  // Check if production
  isProduction() {
    return this.getEnvironment() === 'production';
  }

  // Check if development
  isDevelopment() {
    return this.getEnvironment() === 'development';
  }

  // Get all configuration
  getAllConfig() {
    return {
      environment: this.getEnvironment(),
      sms: this.getSMSConfig(),
      otp: this.getOTPConfig(),
      database: this.getDatabaseConfig(),
      redis: this.getRedisConfig(),
      jwt: this.getJWTConfig(),
      api: this.getAPIConfig(),
      features: this.getFeatureFlags(),
      testing: this.getTestingConfig(),
      security: this.getSecurityConfig()
    };
  }

  // Print configuration summary
  printSummary() {
    const config = this.getAllConfig();
    const sms = config.sms;
    const features = config.features;
    
    console.log('\n🚀 === VibeLedger Real-Time Configuration ===');
    console.log(`📱 Environment: ${config.environment}`);
    console.log(`📞 SMS Provider: ${sms.provider}`);
    console.log(`✅ Real-time SMS: ${features.enableRealTimeSMS ? 'Enabled' : 'Disabled'}`);
    console.log(`🔒 Rate Limiting: ${features.enableRateLimiting ? 'Enabled' : 'Disabled'}`);
    console.log(`🧪 Testing Mode: ${features.enableSMSTesting ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Request Logging: ${features.enableRequestLogging ? 'Enabled' : 'Disabled'}`);
    console.log(`🔑 OTP Expiry: ${config.otp.expiryMinutes} minutes`);
    console.log(`📱 API Port: ${config.api.port}`);
    console.log('='.repeat(50));
  }
}

module.exports = new RealTimeConfig();
