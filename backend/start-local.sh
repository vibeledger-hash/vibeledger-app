#!/bin/bash

# MicroShield Backend Local Server
echo "🚀 Starting MicroShield Backend Local Server..."

# Create a simple local deployment script
cd /Users/2271962/Vibe_Project/VibeLedgerApp/backend

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export NODE_ENV=development
export PORT=3000

# Start the server
echo "🌟 MicroShield Backend starting on http://localhost:3000"
echo "📱 API Endpoints:"
echo "   GET  /health"
echo "   POST /api/auth/request-otp"
echo "   POST /api/auth/verify-otp"
echo "   GET  /api/wallet/balance"
echo "   POST /api/transactions/send"
echo "   GET  /api/ble/devices"
echo ""
echo "Press Ctrl+C to stop the server"

node local-test.js
