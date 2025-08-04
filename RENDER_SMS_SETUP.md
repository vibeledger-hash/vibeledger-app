# 🚀 Render Deployment with Real-Time SMS Setup

## Production SMS Configuration for Render Deployment

This guide explains how to configure real-time Twilio SMS on Render deployment.

### 1. Environment Variables to Set in Render Dashboard

Go to your Render service dashboard and add these environment variables:

#### **Critical SMS Variables** (Set these in Render dashboard)
```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_NUMBER=your_twilio_phone_number_here
```

### 2. How to Add Environment Variables in Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select your service**: vibeledger-backend
3. **Navigate to Environment**: Click "Environment" tab
4. **Add Variables**: Click "Add Environment Variable"
5. **Add each variable**:
   - Key: `TWILIO_ACCOUNT_SID`
   - Value: `your_twilio_account_sid_here`
   - Click "Add"
   
   Repeat for:
   - `TWILIO_AUTH_TOKEN`: `your_twilio_auth_token_here`
   - `TWILIO_FROM_NUMBER`: `your_twilio_phone_number_here`

6. **Save and Deploy**: Render will automatically redeploy with new variables

### 3. Verification Steps

After deployment, test the SMS:

```bash
# Test OTP Request
curl -X POST "https://vibeledger-app.onrender.com/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919007320527"}'

# Expected Response (Real SMS):
{
  "success": true,
  "message": "OTP sent successfully via Twilio",
  "otpId": "otp_xxxxx",
  "provider": "twilio"
}
```

### 4. Key Indicators of Success

✅ **Success**: `"provider": "twilio"` and `"message": "OTP sent successfully via Twilio"`
❌ **Still Demo**: `"provider": "demo"` and `"demoOTP": "123456"`

### 5. Static Outbound IPs

Render requests come from these IPs:
- 44.229.227.142
- 54.188.71.94
- 52.13.128.108

### 6. Current Configuration Status

- ✅ render.yaml configured for production
- ✅ SMS_PROVIDER set to "twilio" 
- ✅ Rate limiting enabled
- ✅ OTP expiry: 5 minutes
- ✅ App config pointing to Render URL
- 🔄 **NEED TO SET**: Twilio credentials in Render dashboard

### 7. Troubleshooting

**If SMS still shows demo mode:**
1. Check Render environment variables are set correctly
2. Verify service has redeployed after adding variables
3. Check logs for Twilio initialization messages
4. Test health endpoint: `https://vibeledger-app.onrender.com/health`

**Expected log messages on successful Twilio setup:**
```
📱 SMS Service: Twilio initialized
✅ Real-time SMS: Enabled
📞 SMS Provider: twilio
```
