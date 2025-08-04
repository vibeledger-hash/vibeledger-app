# 🚀 VibeLedger Real-Time Configuration Guide

## 📋 **Quick Start Commands**

### **Development Setup**
```bash
# Setup development environment
npm run deploy:dev

# Start development server
npm run start:backend

# Test SMS functionality
npm run test:sms

# Check health
npm run health
```

### **Production Deployment**
```bash
# Validate production config
npm run validate:config production

# Deploy to production
npm run deploy:prod

# Start production server
npm run start:prod
```

## 🎯 **Real-Time Features Enabled**

### ✅ **SMS Integration**
- **Provider**: Twilio (Primary)
- **From Number**: +13186121926
- **Backup Providers**: AWS SNS, TextLocal, Vonage
- **Rate Limiting**: 2 SMS/minute, 10/hour
- **Real-time Delivery**: ✅ Working

### ✅ **OTP System**
- **Length**: 6 digits
- **Expiry**: 5 minutes
- **Max Attempts**: 3
- **Auto Cleanup**: Every 10 minutes
- **Real-time Generation**: ✅ Working

### ✅ **API Security**
- **JWT Authentication**: 24h expiry
- **Rate Limiting**: 100 requests/15 minutes
- **CORS Protection**: Configured
- **Request Logging**: Enabled

### ✅ **Database Integration**
- **Type**: PostgreSQL
- **Connection Pooling**: 2-10 connections
- **SSL Support**: Available
- **Environment**: Development/Production ready

## 📁 **Configuration Files**

### **Development**: `.env`
- Current working configuration
- Twilio SMS enabled
- Debug features enabled
- Testing endpoints enabled

### **Production**: `.env.prod`
- Production-ready settings
- Enhanced security
- Performance optimizations
- Monitoring enabled

## 🔧 **Configuration Management**

### **Real-Time Config Manager**
- **File**: `backend/config/realtime-config.js`
- **Features**: Environment detection, validation, feature flags
- **Usage**: Automatically loaded by server

### **Deployment Manager**
- **File**: `backend/deploy.js`
- **Features**: Dependency checking, config validation, health monitoring
- **Usage**: `node deploy.js [command]`

## 📱 **SMS Provider Status**

| Provider | Status | Use Case | Free Credits |
|----------|--------|----------|--------------|
| **Twilio** | ✅ Active | Global SMS | $15 credit |
| **AWS SNS** | 🟡 Configured | Backup | 100 SMS/month |
| **TextLocal** | 🟡 Available | India | Free trial |
| **Vonage** | 🟡 Available | Europe | €2 credit |

## 🧪 **Testing & Validation**

### **SMS Testing**
```bash
# Test SMS with your phone number
npm run test:sms

# Test specific provider
SMS_PROVIDER=twilio npm run test:sms
```

### **API Testing**
```bash
# Test OTP request
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919007320527"}'

# Test health endpoint
curl http://localhost:3000/health
```

## 🚀 **Production Checklist**

### **Before Deployment:**
- [ ] Validate production config: `npm run validate:config production`
- [ ] Test SMS functionality: `npm run test:sms`
- [ ] Check dependencies: `npm audit`
- [ ] Update environment variables
- [ ] Configure backup SMS providers

### **After Deployment:**
- [ ] Health check: `npm run health`
- [ ] Monitor SMS delivery
- [ ] Check error logs
- [ ] Verify rate limiting
- [ ] Test mobile app integration

## 🔍 **Monitoring & Debugging**

### **Log Levels**
- **Development**: Debug, Info, Warn, Error
- **Production**: Info, Warn, Error only

### **Key Metrics**
- SMS delivery success rate
- OTP verification success rate
- API response times
- Error rates by endpoint

### **Debug Flags**
```env
DEBUG_SMS=true          # SMS provider debugging
DEBUG_OTP=true          # OTP generation debugging  
DEBUG_AUTH=true         # Authentication debugging
```

## 💡 **Best Practices**

### **SMS Configuration**
- Always configure backup providers
- Monitor SMS credits/usage
- Test with verified phone numbers first
- Use appropriate rate limiting

### **Security**
- Keep JWT secrets secure
- Use strong encryption keys
- Enable HTTPS in production
- Monitor failed authentication attempts

### **Performance**
- Use Redis for OTP storage in production
- Enable response caching
- Configure proper database connection pooling
- Monitor memory usage

## 🆘 **Troubleshooting**

### **SMS Not Sending**
1. Check Twilio account status
2. Verify phone number format (+country code)
3. Check SMS provider credentials
4. Review rate limiting settings

### **OTP Verification Failing**
1. Check OTP expiry time
2. Verify OTP storage (memory/Redis)
3. Check max attempts configuration
4. Review time synchronization

### **Server Issues**
1. Check configuration validation
2. Review dependency installation
3. Verify environment variables
4. Check port availability

## 📞 **Support**

- **Configuration Issues**: Check `backend/config/realtime-config.js`
- **SMS Problems**: Review `backend/services/sms.js`
- **OTP Issues**: Check `backend/services/otp.js`
- **API Problems**: Review `backend/standalone-server.js`

Your VibeLedger app is now configured for **real-time SMS delivery** with **production-ready** settings! 🎉
