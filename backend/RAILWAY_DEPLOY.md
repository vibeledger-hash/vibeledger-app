# MicroShield Backend - Railway Deployment

## Quick Deploy to Railway

1. Visit: https://railway.app
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Connect this repository
5. Railway will automatically detect and deploy your Node.js app

## Environment Variables to Set:
- NODE_ENV=production
- PORT=3000

## Your app will be available at:
https://your-app-name.up.railway.app

## Endpoints:
- GET /health
- POST /api/auth/request-otp
- POST /api/auth/verify-otp  
- GET /api/wallet/balance
- POST /api/transactions/send
- GET /api/ble/devices
