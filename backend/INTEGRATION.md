# 📱 React Native Integration Guide

## Quick Setup

Update your React Native app's API service to connect to the backend:

### 1. Update API Base URL

In your `src/services/apiService.js`:

```javascript
// For development
const API_BASE_URL = 'http://localhost:3000';

// For iOS simulator, you might need:
// const API_BASE_URL = 'http://127.0.0.1:3000';

// For Android emulator, you might need:
// const API_BASE_URL = 'http://10.0.2.2:3000';
```

### 2. Test Authentication Flow

Since Twilio isn't configured yet, you can test the backend by temporarily bypassing OTP:

```javascript
// Test user from seeded data
const testUser = {
  phoneNumber: '+1234567890',
  walletBalance: 1000.00
};
```

### 3. Available Endpoints

**Authentication:**
- `POST /api/auth/request-otp` - Request OTP (needs Twilio)
- `POST /api/auth/verify-otp` - Verify OTP and get JWT
- `POST /api/auth/refresh` - Refresh JWT token

**Wallet Operations (require JWT):**
- `GET /api/wallet/balance` - Get current balance
- `GET /api/wallet/history` - Transaction history
- `GET /api/wallet/info` - Detailed wallet info

**Transactions (require JWT):**
- `POST /api/transaction/initiate` - Start payment
- `POST /api/transaction/confirm` - Confirm with OTP
- `POST /api/transaction/sync` - Sync offline transactions

**BLE & Merchants:**
- `GET /api/ble/categories` - Get merchant categories (no auth)
- `POST /api/ble/discover` - Find nearby merchants (requires JWT)
- `POST /api/ble/register` - Register new merchant

### 4. Sample API Calls

```javascript
// Get merchant categories (no auth required)
const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/ble/categories`);
  return response.json();
};

// Get wallet balance (requires JWT)
const getWalletBalance = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Initiate transaction (requires JWT)
const initiateTransaction = async (token, merchantId, amount) => {
  const response = await fetch(`${API_BASE_URL}/api/transaction/initiate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      merchantId,
      amount,
      description: 'Mobile payment'
    })
  });
  return response.json();
};
```

### 5. Error Handling

The API returns standardized error responses:

```javascript
{
  "error": "Error message",
  "code": "ERROR_CODE", 
  "timestamp": "2025-01-28T10:00:00Z",
  "path": "/api/endpoint"
}
```

Common error codes:
- `MISSING_TOKEN` - Authorization required
- `INVALID_TOKEN` - JWT token invalid/expired
- `VALIDATION_ERROR` - Request validation failed
- `INSUFFICIENT_FUNDS` - Not enough balance
- `WALLET_LOCKED` - Wallet is locked

### 6. Testing Without Twilio

For development, you can create a temporary test endpoint or mock the OTP verification. The seeded test user has:
- Phone: `+1234567890`
- Wallet Balance: `$1000.00`
- 3 sample merchants available

### 7. Next Steps

1. **Update your React Native API service** to use `http://localhost:3000`
2. **Test the connection** with the categories endpoint
3. **Implement JWT storage** for authenticated requests
4. **Configure Twilio** when ready for OTP functionality
5. **Test transaction flows** with the seeded merchants

The backend is fully functional and ready for integration! 🚀
