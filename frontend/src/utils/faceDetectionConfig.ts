/**
 * Face Detection Configuration
 * Handles switching between mock and real face detection based on environment
 * 
 * BUILD TYPES EXPLAINED:
 * - 'development': Local development with Expo CLI (__DEV__ = true)
 * - 'production-with-native': Production build with native modules (EAS Build + Development Build)
 * - 'production-managed': Production build without native modules (Expo managed - PROBLEMATIC)
 * 
 * PRODUCTION STRATEGY:
 * - ✅ development: Use mock face detection for testing
 * - ✅ production-with-native: Use real ML Kit face detection
 * - ❌ production-managed: Cannot use ML Kit, must use server-side detection
 */

export const FACE_DETECTION_CONFIG = {
  // Enable mock face detection in development
  useMockInDev: __DEV__,
  
  // Enable real face detection in production builds
  useRealInProduction: true,
  
  // Fallback to mock if real face detection fails to load
  fallbackToMock: true,
  
  // Mock face detection settings
  mockSettings: {
    faceHeightPercentage: 60, // Mock face takes up 60% of image height
    faceAspectRatio: 0.8, // Width/Height ratio
    topOffset: 15, // Face starts 15% from top
    eyeOpenProbability: 0.9, // Mock eyes open probability
  }
};

export const getBuildType = () => {
  // Check if we're in development mode
  if (__DEV__) {
    return 'development';
  }
  
  // For production builds, check if native modules are available
  try {
    require('@react-native-ml-kit/face-detection');
    return 'production-with-native'; // Production build with native modules (Expo Development Build or bare React Native)
  } catch {
    return 'production-managed'; // Production build without native modules (Expo managed)
  }
};

export const shouldUseMockFaceDetection = (): boolean => {
  const buildType = getBuildType();
  
  // PRODUCTION SAFETY: Only allow mock in development
  // In production, we must have native modules available
  if (!__DEV__ && buildType === 'production-managed') {
    throw new Error(
      '🚨 PRODUCTION ERROR: Cannot use mock face detection in production Expo managed builds. ' +
      'Options: 1) Use Expo Development Build with native modules, or 2) Implement server-side face detection.'
    );
  }
  
  switch (buildType) {
    case 'development':
      return FACE_DETECTION_CONFIG.useMockInDev;
    case 'production-managed':
      return true; // Use mock (but this should trigger error above in production)
    case 'production-with-native':
      return false; // Use real face detection with native modules
    default:
      return FACE_DETECTION_CONFIG.fallbackToMock;
  }
};

/**
 * Validates that the current configuration is safe for production
 */
export const validateProductionSafety = (): void => {
  if (!__DEV__) { // In any production build
    const buildType = getBuildType();
    
    if (buildType === 'production-managed') {
      console.error(
        '❌ PRODUCTION WARNING: Using Expo managed workflow in production. ' +
        'Face detection requires native modules. Consider using Expo Development Build.'
      );
    }
    
    if (shouldUseMockFaceDetection()) {
      throw new Error(
        '🚨 PRODUCTION ERROR: Mock face detection is active in production build. ' +
        'This should never happen. Check your build configuration.'
      );
    }
    
    console.log('✅ Production build validation passed - real face detection active');
  }
};
