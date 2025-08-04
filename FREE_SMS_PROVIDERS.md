# 🆓 Free SMS Providers for VibeLedger

Here are the best free SMS providers for real-time OTP sending:

## 🌟 Recommended Free Options

### 1. **Twilio** (Best Overall)
- **Free Credit**: $15 free trial credit
- **Coverage**: Global (200+ countries)
- **Cost**: ~$0.0075 per SMS in US, varies by country
- **Pros**: Excellent delivery rates, easy setup, great documentation
- **Setup**: Sign up at https://www.twilio.com/try-twilio

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

### 2. **AWS SNS** (Good for AWS Users)
- **Free Tier**: 100 SMS/month free for 12 months
- **Coverage**: Global
- **Cost**: $0.00645 per SMS in US after free tier
- **Pros**: Good integration with AWS services
- **Setup**: Requires AWS account

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### 3. **TextLocal** (India-focused)
- **Free Trial**: Limited free SMS for testing
- **Coverage**: Primarily India
- **Cost**: ₹0.25 per SMS in India
- **Pros**: Very cheap for Indian numbers
- **Setup**: https://www.textlocal.in/signup

```env
TEXTLOCAL_API_KEY=your_api_key
TEXTLOCAL_SENDER=VIBE
```

### 4. **Vonage (Nexmo)**
- **Free Credit**: €2 credit on signup
- **Coverage**: Global
- **Cost**: Varies by destination
- **Pros**: Good API, reliable delivery

### 5. **MessageBird**
- **Free Trial**: €20 credit
- **Coverage**: Global
- **Cost**: Competitive pricing
- **Pros**: Good for European markets

## 🧪 Testing-Only Free Services

### **SMS4Free** (Testing Only)
- Completely free but unreliable
- Good for development testing only
- Not recommended for production

### **Fast2SMS** (India)
- Free tier available
- India-focused
- Good for local testing

## 💡 Getting Started Steps

### For Twilio (Recommended):
1. **Sign up**: Go to https://www.twilio.com/try-twilio
2. **Verify your phone**: Complete phone verification
3. **Get credentials**: 
   - Account SID from Console Dashboard
   - Auth Token from Console Dashboard
4. **Get phone number**: 
   - Buy a phone number (uses trial credit)
   - Note the number (e.g., +1234567890)
5. **Add to .env**:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_FROM_NUMBER=+1234567890
   ```

### For AWS SNS:
1. **AWS Account**: Create free AWS account
2. **IAM User**: Create user with SNS permissions
3. **Credentials**: Get Access Key ID and Secret
4. **Add to .env**:
   ```env
   AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXX
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```

## 🚀 Quick Setup

Run our automated setup:
```bash
npm run setup:sms
```

Or manually create `backend/.env` with your chosen provider credentials.

## 📊 Cost Comparison (per SMS)

| Provider | US | India | Europe | Free Credit |
|----------|-------|-------|--------|-------------|
| Twilio | $0.0075 | $0.0075 | $0.0075 | $15 |
| AWS SNS | $0.00645 | $0.00645 | $0.00645 | 100 SMS/month |
| TextLocal | N/A | ₹0.25 | N/A | Limited trial |
| Vonage | $0.0072 | $0.0072 | $0.0050 | €2 |

## 🎯 Best Choice for You

**For Global Use**: Twilio (best reliability + $15 free credit)
**For India Only**: TextLocal (cheapest for Indian numbers)
**For AWS Users**: AWS SNS (100 free SMS/month)
**For Testing**: Any of the above with free credits

Your VibeLedger app supports all these providers - just add the credentials and restart the server!
