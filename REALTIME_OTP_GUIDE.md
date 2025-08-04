# 🚀 Real-Time OTP Setup Guide

Your VibeLedger app is now equipped with a production-ready real-time OTP system! Follow this guide to enable actual SMS sending.

## 📋 Current Status
- ✅ Backend server running with SMS infrastructure
- ✅ Multi-provider SMS support (Twilio, AWS SNS, TextLocal)
- ✅ OTP management with security features
- ⚠️ Currently running in **DEMO mode** - configure providers for real SMS

## 🎯 Quick Setup (Recommended)

### Option 1: Automated Setup Script
Run our interactive setup script to configure SMS providers:

```bash
cd /Users/2271962/Vibe_Project/VibeLedgerApp
npm run setup:sms
```

This will guide you through:
1. Choosing an SMS provider
2. Setting up credentials
3. Testing the configuration

### Option 2: Manual Configuration

#### Step 1: Choose Your SMS Provider

**🌟 Recommended: Twilio (Global)**
- Best delivery rates worldwide
- Easy setup and testing
- $15 free trial credit
- Sign up: https://www.twilio.com/try-twilio

**📍 For India: TextLocal**
- Excellent for Indian phone numbers
- Cost-effective for local usage
- Sign up: https://www.textlocal.in/signup

**☁️ AWS SNS (Advanced)**
- Good for existing AWS users
- Requires more configuration
- Sign up: https://aws.amazon.com/sns/

#### Step 2: Get Your Credentials

**For Twilio:**
1. Create account at https://www.twilio.com/try-twilio
2. Get your Account SID and Auth Token from Console
3. Purchase a phone number for sending SMS

**For TextLocal:**
1. Create account at https://www.textlocal.in/signup
2. Get your API Key from dashboard
3. Set up sender name (6 characters max)

**For AWS SNS:**
1. Create AWS account
2. Create IAM user with SNS permissions
3. Get Access Key ID and Secret Access Key

#### Step 3: Configure Environment Variables

Create/update `.env` file in the `backend` directory:

**For Twilio:**
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
```

**For TextLocal:**
```env
TEXTLOCAL_API_KEY=your_api_key_here
TEXTLOCAL_SENDER=VIBE
```

**For AWS SNS:**
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

#### Step 4: Restart Backend Server

```bash
cd /Users/2271962/Vibe_Project/VibeLedgerApp
npm run start:backend
```

You should see:
```
📱 ✅ Real SMS enabled with providers: twilio
📦 SMS Providers: twilio
```

## 🧪 Testing Real OTP

1. **Test OTP Generation:**
```bash
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

2. **Check Your Phone** - You should receive a real SMS with 6-digit OTP

3. **Test OTP Verification:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"otpId": "your_otp_id", "otp": "123456"}'
```

## 📱 Mobile App Features

Once real SMS is enabled, your mobile app will:
- ✅ Send actual OTP to user's phone number
- ✅ Show appropriate success messages
- ✅ Handle real SMS delivery confirmations
- ✅ Provide fallback to demo mode if needed

## 🔧 Troubleshooting

### "Still in Demo Mode"
- Check that environment variables are set correctly
- Restart the backend server after adding credentials
- Verify credentials with your SMS provider

### "SMS Not Received"
- Check phone number format (include country code: +1234567890)
- Verify SMS provider account has sufficient credits
- Check provider dashboard for delivery logs

### "API Errors"
- Check backend server logs for detailed error messages
- Verify network connectivity
- Ensure all required environment variables are set

## 💰 SMS Provider Costs

**Twilio:**
- ~$0.0075 per SMS in US
- $15 free trial credit
- Pay-as-you-go pricing

**TextLocal:**
- ₹0.25 per SMS in India
- Bulk pricing available
- Prepaid credits system

**AWS SNS:**
- $0.00645 per SMS in US
- Free tier: 100 SMS/month
- Pay-per-use model

## 🚀 Production Deployment

For production deployment:
1. Use environment variables on your hosting platform
2. Set up proper monitoring and logging
3. Configure rate limiting for your usage
4. Set up SMS delivery monitoring
5. Consider backup SMS providers for reliability

## 📞 Support

If you need help:
1. Check the backend server logs for error messages
2. Verify your SMS provider credentials
3. Test with the automated setup script
4. Ensure your phone number format is correct

Your real-time OTP system is ready! 🎉
