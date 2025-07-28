# MicroShield - Frontend Integration Guide

## Backend API Endpoints

Your MicroShield backend is ready with these endpoints:

### Base URL
- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-deployed-app.com` (once deployed)

### API Endpoints

#### Authentication
```javascript
// Request OTP
POST /api/auth/request-otp
{
  "phoneNumber": "+1234567890",
  "purpose": "login"
}

// Verify OTP  
POST /api/auth/verify-otp
{
  "otpId": "otp_123456789",
  "otp": "123456",
  "phoneNumber": "+1234567890"
}
```

#### Wallet
```javascript
// Get Balance
GET /api/wallet/balance
Headers: { "Authorization": "Bearer jwt_token" }
```

#### Transactions
```javascript
// Send Payment
POST /api/transactions/send
{
  "recipientId": "user_123",
  "amount": 50.00,
  "description": "Payment for coffee"
}

// Transaction History
GET /api/transactions/history
```

#### BLE Devices
```javascript
// Get Devices
GET /api/ble/devices

// Pair Device
POST /api/ble/pair
{
  "deviceId": "device_001",
  "pinCode": "1234"
}
```

## React Native Integration

### Update your API service file:

```javascript
// src/services/api.js
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : 'https://your-production-url.com';

export const apiService = {
  async requestOTP(phoneNumber) {
    const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, purpose: 'login' })
    });
    return response.json();
  },

  async verifyOTP(otpId, otp, phoneNumber) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otpId, otp, phoneNumber })
    });
    return response.json();
  },

  async getWalletBalance(token) {
    const response = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async sendTransaction(transactionData, token) {
    const response = await fetch(`${API_BASE_URL}/api/transactions/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData)
    });
    return response.json();
  }
};
```

## Testing

1. **Start Backend**: `./run-local.sh`
2. **Test Health**: Visit `http://localhost:3000/health`
3. **Test API**: Use the endpoints above
4. **Run React Native**: `npx react-native run-ios` or `npx react-native run-android`
