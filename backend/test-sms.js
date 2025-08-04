#!/usr/bin/env node

/**
 * Quick SMS Provider Test Script
 * Test your SMS providers without starting the full backend
 */

require('dotenv').config();
const smsService = require('./services/sms');

async function testSMSProvider() {
  console.log('🧪 SMS Provider Test\n');
  
  // Check which providers are configured
  const providers = [];
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    providers.push('✅ Twilio - Configured');
  } else {
    providers.push('❌ Twilio - Not configured');
  }
  
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    providers.push('✅ AWS SNS - Configured');
  } else {
    providers.push('❌ AWS SNS - Not configured');
  }
  
  if (process.env.TEXTLOCAL_API_KEY) {
    providers.push('✅ TextLocal - Configured');
  } else {
    providers.push('❌ TextLocal - Not configured');
  }
  
  if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
    providers.push('✅ Vonage - Configured');
  } else {
    providers.push('❌ Vonage - Not configured');
  }
  
  console.log('📋 Provider Status:');
  providers.forEach(p => console.log(`   ${p}`));
  console.log();
  
  // Test OTP generation
  const testOTP = smsService.generateOTP();
  console.log(`🔑 Generated Test OTP: ${testOTP}`);
  
  // Test phone number (replace with your number for real test)
  const testPhone = process.env.TEST_PHONE_NUMBER || '+1234567890';
  console.log(`📱 Test Phone Number: ${testPhone}`);
  console.log('   (Set TEST_PHONE_NUMBER in .env for real SMS test)\n');
  
  try {
    const result = await smsService.sendOTP(testPhone, testOTP);
    console.log('✅ SMS Test Result:');
    console.log(`   Provider: ${result.provider}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    if (result.messageId) {
      console.log(`   Message ID: ${result.messageId}`);
    }
    if (result.demoOTP) {
      console.log(`   🎭 Demo OTP: ${result.demoOTP}`);
    }
  } catch (error) {
    console.error('❌ SMS Test Failed:', error.message);
  }
}

// Show free provider instructions
function showFreeProviderInstructions() {
  console.log(`
🆓 GET FREE SMS CREDITS:

1️⃣ TWILIO ($15 FREE CREDIT) - RECOMMENDED
   • Sign up: https://www.twilio.com/try-twilio
   • Get $15 free credit (~2000 SMS)
   • Best global delivery rates
   
2️⃣ AWS SNS (100 FREE SMS/MONTH)
   • Sign up: https://aws.amazon.com/sns/
   • 100 SMS/month free for 12 months
   • Good for low-volume testing
   
3️⃣ VONAGE (€2 FREE CREDIT)
   • Sign up: https://developer.vonage.com/sign-up
   • €2 free credit
   • Good European coverage
   
4️⃣ TEXTLOCAL (FREE TRIAL)
   • Sign up: https://www.textlocal.in/signup
   • Limited free SMS for testing
   • Best for India

🚀 Quick Setup:
   npm run setup:sms

📝 Manual Setup:
   Add credentials to backend/.env and set SMS_PROVIDER
  `);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showFreeProviderInstructions();
  } else {
    testSMSProvider().catch(console.error);
  }
}

module.exports = { testSMSProvider };
