# 🔍 Build Types & Face Detection Strategy Explained

## 📊 Build Types Matrix

| Build Type | Environment | Native Modules | Face Detection | Use Case |
|------------|-------------|----------------|----------------|----------|
| **`development`** | Local dev (`__DEV__ = true`) | ❌ | Mock | Development & testing |
| **`production-with-native`** | Production (`__DEV__ = false`) | ✅ | Real ML Kit | **Recommended production** |
| **`production-managed`** | Production (`__DEV__ = false`) | ❌ | ⚠️ Error/Server | Expo managed (problematic) |

## 🚨 Why We Throw Errors

### **Original Problematic Logic:**
```typescript
// ❌ WRONG: This was confusing and overly restrictive
if (process.env.NODE_ENV === 'production' && buildType !== 'development-build') {
    throw new Error('...');
}
```

**Problems with original logic:**
1. `buildType !== 'development-build'` is backwards - development builds should work in production
2. There was no `'production-build'` type, only `'development-build'`
3. It would error on legitimate production scenarios

### **Fixed Logic:**
```typescript
// ✅ CORRECT: Only error when mock detection is needed in production
if (!__DEV__ && buildType === 'production-managed') {
    throw new Error('Cannot use mock face detection in production');
}
```

**Why this makes sense:**
1. **Development**: Mock detection is fine for testing
2. **Production with native**: Real ML Kit works perfectly
3. **Production managed**: Mock detection would ship to users (BAD!)

## 🎯 Build Scenarios

### **Scenario 1: Development (Current)**
```bash
expo start
```
- `__DEV__ = true`
- `buildType = 'development'`
- `faceDetection = 'mock'` ✅
- **Result**: Mock face detection for testing

### **Scenario 2: Production with Native Modules (Recommended)**
```bash
# Setup development build
npx expo install expo-dev-client
eas build --profile production

# Deploy
eas submit
```
- `__DEV__ = false`
- `buildType = 'production-with-native'`
- `faceDetection = 'real ML Kit'` ✅
- **Result**: Real face detection in production

### **Scenario 3: Production Expo Managed (Problematic)**
```bash
# This would be problematic
eas build --profile production --platform all
# Without expo-dev-client or native modules
```
- `__DEV__ = false`
- `buildType = 'production-managed'`
- `faceDetection = 'would be mock'` ❌
- **Result**: ERROR thrown to prevent shipping mock code

## 💡 Summary

**The error prevents you from accidentally shipping mock face detection to real users.** 

In production, you need either:
1. **Real face detection** (with native modules)
2. **Server-side face detection** (remove client-side detection entirely)

**Never ship mock face detection to production users!** 🚫
