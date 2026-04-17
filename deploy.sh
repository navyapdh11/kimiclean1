#!/bin/bash
set -e

echo "🚀 KimiClean v1.0 Deployment"

# 1. Environment check
if [ -f .env.local ]; then
    echo "✅ Environment file found"
else
    echo "❌ Missing .env.local file"
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Type check
echo "🔍 Running type check..."
npm run type-check

# 4. Build
echo "⚡ Building..."
npm run build

# 5. Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
