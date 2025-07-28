#!/bin/bash

# MicroShield Backend API Test Script

BASE_URL="http://localhost:8080"

echo "🧪 Testing MicroShield Backend API..."

# Test health endpoint
echo ""
echo "1. Testing health check..."
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" \
  --silent --show-error | jq '.' 2>/dev/null || echo "Health check failed"

# Test OTP request
echo ""
echo "2. Testing OTP request..."
curl -X POST "$BASE_URL/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "purpose": "login"
  }' \
  --silent --show-error | jq '.' 2>/dev/null || echo "OTP request failed"

# Test invalid OTP verification (should fail)
echo ""
echo "3. Testing OTP verification (should fail with invalid code)..."
curl -X POST "$BASE_URL/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otpCode": "000000",
    "purpose": "login"
  }' \
  --silent --show-error | jq '.' 2>/dev/null || echo "OTP verification test completed"

echo ""
echo "✅ API test completed!"
echo ""
echo "To run the backend locally:"
echo "  cd backend"
echo "  npm start"
echo ""
echo "To test with a real Firebase project:"
echo "  1. Set up your .env file with Firebase credentials"
echo "  2. Run: npm start"
echo "  3. Run this test script again"
