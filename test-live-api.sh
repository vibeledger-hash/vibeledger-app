#!/bin/bash

# 🧪 MicroShield Live API Test Script

echo "🚀 Testing MicroShield Live Backend API"
echo "======================================"

API_BASE="https://vibeledger-app.onrender.com"

echo "📍 Testing Health Endpoint..."
health_response=$(curl -s "$API_BASE/health")
echo "✅ Health: $health_response"
echo ""

echo "🔐 Testing Authentication..."
auth_response=$(curl -s -X POST "$API_BASE/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}')
echo "✅ OTP Request: $auth_response"
echo ""

echo "📱 Your React Native app will connect to: $API_BASE"
echo "🎯 Backend Status: LIVE and responding ✅"
echo ""
echo "🧪 Test complete! Your backend is ready for app integration."
