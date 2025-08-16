# Production Build Instructions

## 🚀 How to Deploy Without Mock Code

### Option 1: Expo Development Build (Recommended)

1. **Setup Development Build:**
```bash
# Install development build client
npx expo install expo-dev-client

# Add to app.json
{
  "expo": {
    "plugins": ["expo-dev-client"]
  }
}

# Build development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

2. **The system will automatically:**
   - ✅ Use real ML Kit face detection
   - ❌ Remove mock code (tree-shaking)
   - ✅ Include native modules

### Option 2: Expo Managed with Server-Side Detection

1. **Remove face detection entirely from client:**
```typescript
// In photoValidation.ts - remove all face detection
export const validateHeadSize = async (uri: string): Promise<ValidationResult> => {
  // Skip face detection, assume valid
  return {
    isValid: true,
    message: 'Head position looks good',
    details: { detailedMessage: 'Manual review recommended' }
  };
};
```

2. **Implement server-side detection:**
```python
# Backend with ML Kit or OpenCV
from google.cloud import vision
# or
import cv2
import dlib
```

### Option 3: Conditional Compilation (Advanced)

1. **Use Metro bundler to exclude mock code:**
```javascript
// metro.config.js
module.exports = {
  resolver: {
    alias: {
      '@face-detection': process.env.NODE_ENV === 'production' 
        ? './src/utils/realFaceDetection'
        : './src/utils/mockFaceDetection'
    }
  }
};
```

## 🔧 Current Implementation Status

**✅ What's Working Now:**
- Automatic detection of build type
- Smart switching between mock and real detection
- Configuration-based settings
- No crashes in Expo managed workflow

**📋 Production Checklist:**
- [ ] Test with `eas build`
- [ ] Verify ML Kit works in development build
- [ ] Test face detection accuracy
- [ ] Remove dev console warnings

## 🏗️ Build Types Explained

| Build Type | Face Detection | Use Case |
|------------|----------------|----------|
| **Expo Managed** | Mock | Development, quick testing |
| **Development Build** | Real ML Kit | Production-like testing |
| **Production Build** | Real ML Kit | App Store release |

## 📱 Testing Commands

```bash
# Development (uses mock)
expo start

# Development Build (uses real ML Kit)
eas build --profile development
expo start --dev-client

# Production Build (uses real ML Kit)
eas build --profile production
```
