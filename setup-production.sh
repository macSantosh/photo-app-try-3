#!/bin/bash

# 🚀 Production Build Setup Script (Using Conda Environment)
# Automates the setup for production builds with native modules

echo "🚀 Setting up Production Build with Native Modules..."
echo "=================================================="

# Activate conda environment
echo "🐍 Activating conda environment: react_native_env"
source ~/anaconda3/etc/profile.d/conda.sh
conda activate react_native_env

# Navigate to frontend directory
cd /Users/macsantosh/Development/python/anthropic/photo-app-try-3/frontend

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI already installed"
fi

# Check if user is logged in
echo "🔐 Checking EAS login status..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to EAS. Please login:"
    eas login
else
    echo "✅ Already logged in to EAS"
fi

# Install expo-dev-client
echo "📦 Installing expo-dev-client..."
npx expo install expo-dev-client

# Restore eas.json if it was backed up
if [ -f "eas.json.backup" ]; then
    echo "🔄 Restoring eas.json configuration..."
    mv eas.json.backup eas.json
fi

# Configure EAS Build if not already configured
if [ ! -f "eas.json" ]; then
    echo "⚙️ Configuring EAS Build..."
    eas build:configure
else
    echo "✅ EAS Build already configured"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps (with conda environment):"
echo "1. conda activate react_native_env"
echo "2. cd /Users/macsantosh/Development/python/anthropic/photo-app-try-3/frontend"
echo "3. eas build --profile production --platform all"
echo ""
echo "🔍 Build Commands Available:"
echo "• Development: conda activate react_native_env && yarn start"
echo "• Production: conda activate react_native_env && eas build --profile production"
echo ""
echo "✅ Your app will now use real face detection in production builds!"
