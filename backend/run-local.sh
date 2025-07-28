#!/bin/bash

echo "🚀 Starting MicroShield Backend Local Server..."
echo "📱 This will start your backend at http://localhost:3000"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this from the backend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌟 Starting MicroShield Backend..."
echo "📍 Server will run at: http://localhost:3000"
echo "🔗 Health check: http://localhost:3000/health"
echo "📚 API docs: http://localhost:3000/api/docs"
echo ""
echo "🧪 Test endpoints:"
echo "  GET  http://localhost:3000/health"
echo "  POST http://localhost:3000/api/auth/request-otp"
echo "  POST http://localhost:3000/api/auth/verify-otp"
echo "  GET  http://localhost:3000/api/wallet/balance"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Set environment variables
export NODE_ENV=development
export PORT=3000

# Start the server
node standalone-server.js
