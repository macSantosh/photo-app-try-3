#!/bin/bash

# Start Local React Native Development Environment
# This script activates the conda environment and starts the iOS simulator

echo "🚀 Starting React Native development environment..."

# Activate conda environment
echo "📦 Activating conda environment: react_native_env"
conda activate react_native_env

# Navigate to frontend directory and start iOS development server
echo "📱 Starting iOS development server..."
cd frontend && yarn ios

echo "✅ Development environment started!"
