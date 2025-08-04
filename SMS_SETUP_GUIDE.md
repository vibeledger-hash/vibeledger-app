# 📱 Real-Time OTP SMS Setup Guide

Your VibeLedger app now supports **real SMS sending**! Here's how to configure it:

## 🚀 Quick Setup

### Option 1: Twilio (Recommended - Global SMS)

1. **Sign up at [Twilio](https://www.twilio.com/try-twilio)**
2. **Get your credentials** from Twilio Console
3. **Create `.env` file** in backend folder:

```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token  
TWILIO_PHONE_NUMBER=+1234567890
```

4. **Restart backend** - Real SMS will work immediately!

### Option 2: TextLocal (Best for India)

1. **Sign up at [TextLocal.in](https://www.textlocal.in/)**
2. **Get API key** from dashboard
3. **Update `.env` file**:

```bash
SMS_PROVIDER=textlocal
TEXTLOCAL_API_KEY=your_api_key
TEXTLOCAL_SENDER=VIBLED
```

### Option 3: AWS SNS (For AWS users)

```bash
SMS_PROVIDER=aws
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## 🔧 Current Status

✅ **Backend Updated**: Real OTP system implemented  
✅ **SMS Services**: Twilio, AWS SNS, TextLocal support  
✅ **Rate Limiting**: Max 2 OTP per minute per number  
✅ **OTP Expiry**: 5 minutes automatic expiry  
✅ **Validation**: Proper OTP storage and verification  

## 🧪 Testing

1. **Demo Mode** (current): OTP = `123456` (always works)
2. **Real SMS Mode**: Set `SMS_PROVIDER` in `.env` file

## 💰 Pricing (Approximate)

- **Twilio**: $0.0075 per SMS (global)
- **TextLocal**: ₹0.25 per SMS (India)  
- **AWS SNS**: $0.006 per SMS (regional)

## 🔒 Security Features

- ✅ Phone number validation
- ✅ Rate limiting (2 OTP/minute)
- ✅ OTP expiry (5 minutes)
- ✅ Attempt limiting (3 tries)
- ✅ Automatic cleanup of expired OTPs

## 🚀 Next Steps

1. **Choose SMS provider** (Twilio recommended)
2. **Set up account** and get credentials
3. **Update `.env` file** with your credentials
4. **Restart backend** with `npm start`
5. **Test real SMS** on your phone!

## 🔍 Debugging

Check backend logs for:
```
📱 SMS Service: Twilio initialized
✅ OTP sent successfully: otp_xxx to +91xxx
```

## ⚡ Quick Start (5 minutes)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env file with your SMS credentials
nano .env

# 3. Restart backend
npm start

# 4. Test in your app!
```

Your app will now send **real SMS OTP** instead of demo mode! 🎉
