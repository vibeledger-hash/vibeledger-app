// SMS Service for sending real OTP messages
// Multiple provider support: Twilio, AWS SNS, TextLocal (Indian provider)

const crypto = require('crypto');

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'demo'; // 'twilio', 'aws', 'textlocal', 'demo'
    this.init();
  }

  init() {
    switch (this.provider) {
      case 'twilio':
        this.setupTwilio();
        break;
      case 'aws':
        this.setupAWS();
        break;
      case 'textlocal':
        this.setupTextLocal();
        break;
      case 'vonage':
        this.setupVonage();
        break;
      default:
        console.log('📱 SMS Service: Running in DEMO mode');
    }
  }

  setupTwilio() {
    try {
      this.twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('📱 SMS Service: Twilio initialized');
    } catch (error) {
      console.error('❌ Twilio setup failed:', error.message);
      this.provider = 'demo';
    }
  }

  setupAWS() {
    try {
      const AWS = require('aws-sdk');
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
      this.sns = new AWS.SNS();
      console.log('📱 SMS Service: AWS SNS initialized');
    } catch (error) {
      console.error('❌ AWS SNS setup failed:', error.message);
      this.provider = 'demo';
    }
  }

  setupTextLocal() {
    if (!process.env.TEXTLOCAL_API_KEY) {
      console.error('❌ TextLocal API key not found');
      this.provider = 'demo';
      return;
    }
    console.log('📱 SMS Service: TextLocal initialized');
  }

  setupVonage() {
    try {
      if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
        console.error('❌ Vonage credentials not found');
        this.provider = 'demo';
        return;
      }
      // Vonage client will be initialized when needed
      console.log('📱 SMS Service: Vonage initialized');
    } catch (error) {
      console.error('❌ Vonage setup failed:', error.message);
      this.provider = 'demo';
    }
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber, otp) {
    const message = `Your VibeLedger verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`;
    
    console.log(`📱 Sending OTP via ${this.provider}:`, { phoneNumber, otp });

    switch (this.provider) {
      case 'twilio':
        return await this.sendViaTwilio(phoneNumber, message);
      case 'aws':
        return await this.sendViaAWS(phoneNumber, message);
      case 'textlocal':
        return await this.sendViaTextLocal(phoneNumber, message);
      case 'vonage':
        return await this.sendViaVonage(phoneNumber, message);
      default:
        return this.sendViaDemo(phoneNumber, otp);
    }
  }

  async sendViaTwilio(phoneNumber, message) {
    try {
      const result = await this.twilio.messages.create({
        body: message,
        from: process.env.TWILIO_FROM_NUMBER,
        to: phoneNumber
      });
      
      console.log('✅ Twilio SMS sent:', result.sid);
      return {
        success: true,
        provider: 'twilio',
        messageId: result.sid,
        message: 'OTP sent successfully via Twilio'
      };
    } catch (error) {
      console.error('❌ Twilio SMS failed:', error);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  async sendViaAWS(phoneNumber, message) {
    try {
      const params = {
        Message: message,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      };

      const result = await this.sns.publish(params).promise();
      
      console.log('✅ AWS SNS SMS sent:', result.MessageId);
      return {
        success: true,
        provider: 'aws',
        messageId: result.MessageId,
        message: 'OTP sent successfully via AWS SNS'
      };
    } catch (error) {
      console.error('❌ AWS SNS SMS failed:', error);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  async sendViaTextLocal(phoneNumber, message) {
    try {
      const fetch = require('node-fetch');
      const params = new URLSearchParams({
        apikey: process.env.TEXTLOCAL_API_KEY,
        numbers: phoneNumber,
        message: message,
        sender: process.env.TEXTLOCAL_SENDER || 'VIBLED'
      });

      const response = await fetch('https://api.textlocal.in/send/', {
        method: 'POST',
        body: params
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        console.log('✅ TextLocal SMS sent:', result.message_id);
        return {
          success: true,
          provider: 'textlocal',
          messageId: result.message_id,
          message: 'OTP sent successfully via TextLocal'
        };
      } else {
        throw new Error(result.errors?.[0]?.message || 'TextLocal SMS failed');
      }
    } catch (error) {
      console.error('❌ TextLocal SMS failed:', error);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  async sendViaVonage(phoneNumber, message) {
    try {
      const fetch = require('node-fetch');
      
      const response = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: process.env.VONAGE_API_KEY,
          api_secret: process.env.VONAGE_API_SECRET,
          to: phoneNumber.replace('+', ''),
          from: process.env.VONAGE_FROM || 'VibeLedger',
          text: message
        })
      });

      const result = await response.json();
      console.log('📱 Vonage response:', result);

      if (result.messages && result.messages[0].status === '0') {
        return {
          success: true,
          provider: 'vonage',
          messageId: result.messages[0]['message-id'],
          message: 'OTP sent via Vonage'
        };
      } else {
        throw new Error(result.messages?.[0]?.['error-text'] || 'Vonage SMS failed');
      }
    } catch (error) {
      console.error('❌ Vonage SMS failed:', error);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  sendViaDemo(phoneNumber, otp) {
    console.log('🎭 DEMO MODE: OTP would be sent to', phoneNumber);
    console.log('🔑 Demo OTP:', otp);
    
    return {
      success: true,
      provider: 'demo',
      messageId: `demo_${Date.now()}`,
      message: 'OTP generated (Demo mode - check console)',
      demoOTP: otp // Only in demo mode
    };
  }
}

module.exports = new SMSService();
