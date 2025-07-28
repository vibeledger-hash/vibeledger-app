# MicroShield Payments Backend

A secure, scalable backend API for the MicroShield mobile payment system built with Node.js, Express, and PostgreSQL.

## Features

- 🔐 **JWT Authentication** with OTP verification
- 💰 **Wallet Management** with transaction history
- 📱 **Real-time Payments** with offline sync capability
- 🔵 **BLE Merchant Discovery** and registration
- 🛡️ **Security Features** including daily limits and wallet locking
- 🚀 **AWS Lambda Ready** with Serverless Framework
- 📊 **PostgreSQL Database** with Sequelize ORM
- ✅ **Comprehensive Validation** with Joi
- 🧪 **Test Coverage** with Jest

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Twilio Account (for OTP SMS)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb microshield_dev
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Documentation

### Authentication

#### Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "purpose": "login"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otpCode": "123456",
  "purpose": "login"
}
```

### Wallet Operations

#### Get Wallet Balance
```http
GET /api/wallet/balance
Authorization: Bearer <jwt_token>
```

#### Get Transaction History
```http
GET /api/wallet/history?limit=50&offset=0
Authorization: Bearer <jwt_token>
```

### Transactions

#### Initiate Payment
```http
POST /api/transaction/initiate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "merchantId": "uuid",
  "amount": 25.50,
  "description": "Coffee purchase"
}
```

#### Confirm Transaction
```http
POST /api/transaction/confirm
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "transactionId": "uuid",
  "otpCode": "123456"
}
```

#### Sync Offline Transactions
```http
POST /api/transaction/sync
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "transactions": [
    {
      "uuid": "offline-uuid",
      "merchantId": "merchant-uuid",
      "amount": 15.25,
      "createdAt": "2025-01-28T10:00:00Z"
    }
  ]
}
```

### BLE & Merchant Discovery

#### Discover Nearby Merchants
```http
POST /api/ble/discover?latitude=40.7128&longitude=-74.0060&radius=5
Authorization: Bearer <jwt_token>
```

#### Register Merchant
```http
POST /api/ble/register
Content-Type: application/json

{
  "name": "Coffee Shop",
  "bleId": "ble_coffee_001",
  "category": "Food & Beverage",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St"
  }
}
```

## Database Schema

### Users
- `id` (UUID, Primary Key)
- `phoneNumber` (String, Unique)
- `trustScore` (Decimal 0.0-1.0)
- `isActive` (Boolean)
- `createdAt`, `updatedAt`, `lastLoginAt`

### Wallets
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `balance` (Decimal)
- `currency` (String, default: USD)
- `dailyLimit`, `dailySpent`
- `isLocked` (Boolean)

### Transactions
- `id` (UUID, Primary Key)
- `uuid` (UUID, Unique - for offline sync)
- `userId`, `merchantId` (UUIDs, Foreign Keys)
- `amount` (Decimal)
- `status` (pending, confirmed, failed, cancelled, synced)
- `type` (payment, refund, topup)
- `metadata` (JSONB)

### Merchants
- `id` (UUID, Primary Key)
- `name` (String)
- `bleId` (String, Unique)
- `qrCode` (String, Unique)
- `location` (JSONB)
- `category` (String)
- `trustScore` (Decimal)

### OTPs
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `otpCode` (String, 6 digits)
- `purpose` (login, transaction, registration)
- `expiresAt` (DateTime)
- `verified` (Boolean)
- `attempts` (Integer)

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=microshield_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# OTP/SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
OTP_EXPIRY_MINUTES=5

# AWS (for deployment)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Deployment

### AWS Lambda with Serverless

1. **Configure AWS credentials**
   ```bash
   aws configure
   ```

2. **Deploy to staging**
   ```bash
   npm run deploy
   ```

3. **Deploy to production**
   ```bash
   serverless deploy --stage prod
   ```

### Traditional Server

1. **Build for production**
   ```bash
   NODE_ENV=production npm start
   ```

2. **Using PM2**
   ```bash
   pm2 start index.js --name microshield-api
   ```

## Security Features

- **JWT Token Authentication** with configurable expiry
- **OTP Verification** for all transactions
- **Rate Limiting** on sensitive endpoints
- **Request Validation** with Joi schemas
- **SQL Injection Protection** via Sequelize ORM
- **Daily Transaction Limits** per wallet
- **Wallet Locking** mechanism
- **Trust Score** system for users and merchants

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## Development Scripts

```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run test suite
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run deploy       # Deploy to AWS Lambda
```

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-28T10:00:00Z",
  "path": "/api/endpoint"
}
```

Common error codes:
- `MISSING_TOKEN` - Authorization header missing
- `INVALID_TOKEN` - JWT token invalid or expired  
- `VALIDATION_ERROR` - Request validation failed
- `INSUFFICIENT_FUNDS` - Wallet balance too low
- `DAILY_LIMIT_EXCEEDED` - Transaction exceeds daily limit
- `WALLET_LOCKED` - Wallet is locked for security

## Performance Considerations

- **Database Indexing** on frequently queried fields
- **Connection Pooling** for database connections
- **Transaction Isolation** for payment operations
- **Bulk Operations** for offline transaction sync
- **Caching Strategy** for merchant discovery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.
