#!/bin/bash

# MicroShield Backend - Google Cloud Setup Script

echo "🚀 Setting up MicroShield Backend for Google Cloud Functions..."

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "📋 Please ensure you have:"
echo "1. Created a Google Cloud Project"
echo "2. Enabled the following APIs:"
echo "   - Cloud Functions API"
echo "   - Cloud Firestore API"
echo "   - Firebase Auth API"
echo "   - Cloud Messaging API"
echo "3. Created a service account with appropriate permissions"
echo ""

read -p "Have you completed the above steps? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the setup steps first."
    exit 1
fi

# Authenticate with Google Cloud
echo "🔐 Authenticating with Google Cloud..."
gcloud auth login

# Set the project
echo "📝 Setting Google Cloud project..."
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID

# Initialize Firebase
echo "🔥 Initializing Firebase..."
firebase login
firebase init functions --project $PROJECT_ID

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file
echo "⚙️ Creating environment configuration..."
cp .env.example .env
echo "Please edit .env file with your actual configuration values."

# Deploy to Cloud Functions
echo "🚀 Deploying to Google Cloud Functions..."
read -p "Do you want to deploy now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase deploy --only functions
    echo "✅ Deployment complete!"
    echo "Your API is available at: https://us-central1-$PROJECT_ID.cloudfunctions.net/api"
else
    echo "ℹ️ To deploy later, run: firebase deploy --only functions"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Update your React Native app's API URL"
echo "2. Configure Firebase Auth in your mobile app"
echo "3. Test the endpoints using the provided test script"
echo ""
echo "API Base URL: https://us-central1-$PROJECT_ID.cloudfunctions.net/api"
