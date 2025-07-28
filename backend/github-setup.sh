#!/bin/bash

# 🚀 Quick GitHub Setup for MicroShield Deployment

echo "🔧 Setting up GitHub repository for deployment..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial MicroShield commit"
fi

echo "📋 Repository status:"
git status

echo "
🚀 Next Steps:

1. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: microshield-payments
   - Make it Public (required for free tiers)
   - Don't initialize with README (we have files)

2. **Push to GitHub**:
   git remote add origin https://github.com/YOUR_USERNAME/microshield-payments.git
   git branch -M main
   git push -u origin main

3. **Deploy Options**:
   
   📌 RENDER.COM (Recommended):
   - Visit: https://render.com
   - Sign in with GitHub
   - New Web Service → Connect Repository
   - Auto-deploys with our render.yaml
   
   📌 VERCEL:
   - Visit: https://vercel.com  
   - Import Project → GitHub
   - Auto-deploys with our vercel.json
   
   📌 NETLIFY:
   - Visit: https://netlify.com
   - New site from Git → GitHub
   - Build: npm install, Publish: backend

4. **Test Deployment**:
   curl https://your-app-url/health

✅ All configuration files ready!
✅ Code committed and ready to push!
"
