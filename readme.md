# Photo App - Production Build Guide

## 🚀 Production Build Commands

### **1. Production-with-Native Build (Recommended)**
This creates a production build **with native modules** - supports real ML Kit face detection:

```bash
# Prerequisites
npm install -g eas-cli
eas login

# Setup Development Build (one-time setup)
npx expo install expo-dev-client

# Configure EAS Build (one-time setup)
eas build:configure

# Build with native modules (RECOMMENDED)
eas build --profile production --platform ios
eas build --profile production --platform android
eas build --profile production --platform all  # Both platforms

# Test development build locally
eas build --profile development --platform ios
expo start --dev-client
```

**Result**: `buildType = 'production-with-native'` → ✅ **Uses real ML Kit face detection**

---

### **2. Production-Managed Build (Problematic)**
This creates a production build **without native modules** - will error for face detection:

```bash
# Prerequisites (same as above)
npm install -g eas-cli
eas login

# Configure for managed build (remove expo-dev-client)
# Edit app.json to remove "expo-dev-client" from plugins

# Build without native modules (WILL ERROR)
eas build --profile production --platform ios
eas build --profile production --platform android
```

**Result**: `buildType = 'production-managed'` → ❌ **Will throw error** for face detection

---

## 🏗️ Build Configuration

### **Required app.json for Production-with-Native:**
```json
{
  "expo": {
    "plugins": [
      "expo-dev-client"
    ]
  }
}
```

### **Development Commands:**
```bash
# Development with mock face detection
expo start

# Development with real face detection (requires development build)
expo start --dev-client
```

---

## 📊 Build Types Summary

| Build Type | Command | Native Modules | Face Detection | Recommended |
|------------|---------|----------------|----------------|-------------|
| **Development** | `expo start` | ❌ | Mock | ✅ For testing |
| **Production-with-Native** | `eas build --profile production` | ✅ | Real ML Kit | ✅ **RECOMMENDED** |
| **Production-Managed** | `eas build` (without dev-client) | ❌ | ❌ Error | ❌ Avoid |

---

## ⚡ Quick Start

**For new production deployment:**
```bash
# 1. Setup (one-time)
npm install -g eas-cli
eas login
npx expo install expo-dev-client
eas build:configure

# 2. Build for production
eas build --profile production --platform all

# 3. Submit to stores
eas submit --platform ios
eas submit --platform android
```

**Or use the automated setup script:**
```bash
# Run the automated setup
./setup-production.sh

# Then build
eas build --profile production --platform all
```

**Test different build types:**
```bash
# Development (mock face detection)
expo start

# Development build (real face detection)
eas build --profile development --platform ios
expo start --dev-client

# Production build (real face detection)
eas build --profile production --platform ios
```

The system will automatically:
- ✅ Use real ML Kit face detection
- ❌ Remove mock code via tree-shaking  
- ✅ Validate production safety
- ✅ Throw errors if misconfigured



-------------------------

Create dev build for ios:
 eas build --profile development --platform ios

Run last dev build:

conda activate react_native_env && cd /Users/macsantosh/Development/python/anthropic/photo-app-try-3/frontend && eas build:run --profile development --platform ios

---------------------------------------------------------------
android
 eas build --profile production --platform android


 --------------
 PassportAI Pro
 Passport Photo AI Maker
 Create passport and visa photos with AI-guided accuracy, absolutely Free.

 