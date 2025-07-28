#!/bin/bash
# Render startup script for MicroShield backend

echo "🚀 Starting MicroShield Backend..."
cd backend
npm install
node standalone-server.js
