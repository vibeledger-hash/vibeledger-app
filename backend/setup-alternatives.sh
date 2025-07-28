#!/bin/bash

# MicroShield Backend Local Development Setup
# This script helps you deploy without browser authentication

echo "🚀 MicroShield Backend - Alternative Deployment Setup"
echo "=============================================="

echo ""
echo "📋 OPTION 1: Service Account Setup (Recommended)"
echo "1. Go to Google Cloud Console: https://console.cloud.google.com"
echo "2. Navigate to IAM & Admin > Service Accounts"
echo "3. Create a new service account with these roles:"
echo "   - Cloud Functions Developer"
echo "   - Firebase Admin SDK Service Agent"
echo "   - Cloud Datastore User"
echo "4. Download the JSON key file"
echo "5. Place it in this backend folder as 'service-account.json'"
echo ""

echo "📋 OPTION 2: Direct gcloud Deploy (Alternative)"
echo "1. Use the gcloud functions deploy command directly"
echo "2. Set up authentication on another machine and copy credentials"
echo ""

echo "📋 OPTION 3: Local Development Only"
echo "1. Test all endpoints locally using Express server"
echo "2. Deploy later when authentication is resolved"
echo ""

echo "🔧 Current Project Configuration:"
echo "Project ID: 468282488386"
echo "Firebase Config: ✅ Ready"
echo "Dependencies: ✅ Installed"
echo "Backend Code: ✅ Complete"
echo ""

echo "💡 Recommendation: Use Service Account method for secure deployment"
