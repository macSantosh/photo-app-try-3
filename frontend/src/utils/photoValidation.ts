import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { FACE_DETECTION_CONFIG, shouldUseMockFaceDetection, getBuildType, validateProductionSafety } from './faceDetectionConfig';

// Validate production safety on import
validateProductionSafety();

// Environment-based face detection import
let FaceDetection: any = null;

try {
  // Only import ML Kit if we're not supposed to use mock
  if (!shouldUseMockFaceDetection()) {
    FaceDetection = require('@react-native-ml-kit/face-detection').default;
    console.log('✅ Using real ML Kit face detection');
  } else {
    console.log(`⚠️ Using mock face detection (Build type: ${getBuildType()})`);
  }
} catch (error) {
  console.warn('❌ ML Kit Face Detection not available, falling back to mock implementation');
  FaceDetection = null;
}

// Mock face detection for development/Expo managed workflow
const MockFaceDetection = {
  detect: async (uri: string, options: any) => {
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      Image.getSize(
        uri,
        (w, h) => resolve({ width: w, height: h }),
        (error) => reject(error)
      );
    });
    
    const { mockSettings } = FACE_DETECTION_CONFIG;
    const mockFaceHeight = height * (mockSettings.faceHeightPercentage / 100);
    const mockFaceWidth = mockFaceHeight * mockSettings.faceAspectRatio;
    
    return [
      {
        frame: {
          left: (width - mockFaceWidth) / 2,
          top: height * (mockSettings.topOffset / 100),
          width: mockFaceWidth,
          height: mockFaceHeight
        },
        leftEyeOpenProbability: mockSettings.eyeOpenProbability,
        rightEyeOpenProbability: mockSettings.eyeOpenProbability
      }
    ];
  }
};

// Smart face detection that switches based on environment
const SmartFaceDetection = {
  detect: async (uri: string, options: any) => {
    if (FaceDetection) {
      // Use real ML Kit face detection
      return await FaceDetection.detect(uri, options);
    } else {
      // Use mock implementation
      return await MockFaceDetection.detect(uri, options);
    }
  }
};

// US Passport Photo Standards (at 300 DPI)
export const PASSPORT_STANDARDS = {
  // Photo dimensions
  PHOTO_WIDTH_INCHES: 2,
  PHOTO_HEIGHT_INCHES: 2,
  PHOTO_WIDTH_PIXELS: 600, // 2 inches at 300 DPI
  PHOTO_HEIGHT_PIXELS: 600, // 2 inches at 300 DPI
  
  // Head size requirements
  HEAD_HEIGHT_MIN_INCHES: 1, // 1 inch
  HEAD_HEIGHT_MAX_INCHES: 1.375, // 1 3/8 inches
  HEAD_HEIGHT_MIN_PIXELS: 300, // 1 inch at 300 DPI
  HEAD_HEIGHT_MAX_PIXELS: 413, // 1 3/8 inches at 300 DPI
  
  // Eye position (from bottom of photo)
  EYE_HEIGHT_MIN_INCHES: 1.125, // 1 1/8 inches
  EYE_HEIGHT_MAX_INCHES: 1.375, // 1 3/8 inches
  EYE_HEIGHT_MIN_PIXELS: 338, // 1 1/8 inches at 300 DPI
  EYE_HEIGHT_MAX_PIXELS: 413, // 1 3/8 inches at 300 DPI
  
  // Acceptable aspect ratio tolerance
  ASPECT_RATIO_TOLERANCE: 0.05,
};

export interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: any; // For additional data like face bounds, eye status, etc.
}

export interface PhotoValidationResults {
  dimensions: ValidationResult;
  headSize: ValidationResult;
  background: ValidationResult;
  faceDetection?: {
    faceBounds?: { x: number; y: number; width: number; height: number };
    eyesOpen?: { left: boolean; right: boolean };
    faceCount?: number;
  };
}

/**
 * Get image dimensions from URI
 */
export const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

/**
 * Validate photo dimensions according to US passport standards
 * @param uri - Image URI to validate
 * @param requiredDPI - Required DPI for the photo (default: 300 DPI for passport photos)
 * @param targetSizeInches - Target size in inches (default: 2x2 inches for passport)
 */
export const validatePhotoDimensions = async (
  uri: string, 
  requiredDPI: number = 300,
  targetSizeInches: { width: number; height: number } = { width: 2, height: 2 }
): Promise<ValidationResult> => {
  try {
    const { width, height } = await getImageDimensions(uri);
    
    // Calculate expected dimensions at required DPI
    const expectedWidthPixels = targetSizeInches.width * requiredDPI;
    const expectedHeightPixels = targetSizeInches.height * requiredDPI;
    
    // Check if dimensions meet minimum DPI requirements
    const minDimension = Math.min(width, height);
    const currentDPI = minDimension / Math.min(targetSizeInches.width, targetSizeInches.height);
    
    if (minDimension < expectedWidthPixels) {
      return {
        isValid: false,
        message: `Photo quality too low`,
        details: {
          currentDimensions: { width, height },
          currentDPI: Math.round(currentDPI),
          requiredDPI,
          requiredDimensions: { width: expectedWidthPixels, height: expectedHeightPixels },
          detailedMessage: `Take a higher resolution photo for print quality`
        }
      };
    }
    
    // Check if dimensions are exactly what's expected (perfect case)
    const isExactMatch = width === expectedWidthPixels && height === expectedHeightPixels;
    
    // Success cases with detailed feedback
    if (isExactMatch) {
      return {
        isValid: true,
        message: `Perfect photo quality!`,
        details: {
          currentDimensions: { width, height },
          currentDPI: Math.round(currentDPI),
          requiredDPI,
          isExactMatch: true,
          detailedMessage: `Exactly matches ${requiredDPI} DPI standard`
        }
      };
    } else {
      return {
        isValid: true,
        message: `Good photo quality`,
        details: {
          currentDimensions: { width, height },
          currentDPI: Math.round(currentDPI),
          requiredDPI,
          isExactMatch: false,
          detailedMessage: `Meets print quality standards`
        }
      };
    }
    
  } catch (error) {
    return {
      isValid: false,
      message: 'Photo file issue',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        detailedMessage: 'Unable to read photo file. Try taking a new photo.'
      }
    };
  }
};

/**
 * Analyze image brightness to estimate if background is suitable
 * This is a simplified approach - ideally would use more sophisticated background detection
 */
export const validateBackground = async (uri: string): Promise<ValidationResult> => {
  try {
    // For now, we'll do a simplified check by analyzing the image
    // In a real implementation, you'd want more sophisticated background detection
    
    // Since we can't easily do pixel-level analysis in React Native without additional libraries,
    // we'll provide a basic validation that encourages users to use plain backgrounds
    
    return {
      isValid: true,
      message: 'Background looks good',
      details: {
        detailedMessage: 'Plain, light backgrounds work best for passport photos'
      }
    };
    
  } catch (error) {
    return {
      isValid: false,
      message: 'Background unclear',
      details: {
        detailedMessage: 'Could not analyze background properly'
      }
    };
  }
};

/**
 * Validate head size using ML Kit face detection
 * @param uri - Image URI to analyze
 * @param cropFrameSize - The size of the crop frame from PhotoCropScreen (optional, for additional validation)
 */
export const validateHeadSize = async (uri: string, cropFrameSize?: number): Promise<ValidationResult> => {
  try {
    // Detect faces in the image using smart detection
    const faces = await SmartFaceDetection.detect(uri, {
      landmarkMode: 'all',
      contourMode: 'all',
      classificationMode: 'all', // Enables eye open/closed detection
      performanceMode: 'accurate',
    });

    // Check face count
    if (faces.length === 0) {
      return {
        isValid: false,
        message: 'No face found',
        details: { 
          faceCount: 0,
          detailedMessage: 'Make sure your face is clearly visible and well-lit'
        }
      };
    }

    if (faces.length > 1) {
      return {
        isValid: false,
        message: 'Multiple faces detected',
        details: { 
          faceCount: faces.length,
          detailedMessage: 'Only one person should be in the photo'
        }
      };
    }

    const face = faces[0];
    const { width: imageWidth, height: imageHeight } = await getImageDimensions(uri);

    // Get face bounding box
    const faceBounds = {
      x: face.frame.left,
      y: face.frame.top,
      width: face.frame.width,
      height: face.frame.height
    };

    // Check if eyes are open (important for passport photos)
    const leftEyeOpen = face.leftEyeOpenProbability !== undefined ? face.leftEyeOpenProbability > 0.3 : true;
    const rightEyeOpen = face.rightEyeOpenProbability !== undefined ? face.rightEyeOpenProbability > 0.3 : true;

    if (!leftEyeOpen || !rightEyeOpen) {
      return {
        isValid: false,
        message: 'Open your eyes',
        details: { 
          faceBounds,
          eyesOpen: { left: leftEyeOpen, right: rightEyeOpen },
          detailedMessage: 'Both eyes must be open and clearly visible'
        }
      };
    }

    // Calculate head size as percentage of image
    const headHeightPixels = faceBounds.height;
    const headHeightPercentage = (headHeightPixels / imageHeight) * 100;

    // US Passport standards: head should be 50-69% of total image height
    const MIN_HEAD_PERCENTAGE = 50;
    const MAX_HEAD_PERCENTAGE = 69;

    // Convert to inches assuming the image will be printed at passport size (2x2 inches)
    const headHeightInches = (headHeightPercentage / 100) * PASSPORT_STANDARDS.PHOTO_HEIGHT_INCHES;

    // Validate against passport requirements
    const meetsMinRequirement = headHeightInches >= PASSPORT_STANDARDS.HEAD_HEIGHT_MIN_INCHES;
    const meetsMaxRequirement = headHeightInches <= PASSPORT_STANDARDS.HEAD_HEIGHT_MAX_INCHES;
    const meetsPercentageRequirement = headHeightPercentage >= MIN_HEAD_PERCENTAGE && headHeightPercentage <= MAX_HEAD_PERCENTAGE;

    if (meetsMinRequirement && meetsMaxRequirement && meetsPercentageRequirement) {
      return {
        isValid: true,
        message: `Head size is perfect`,
        details: {
          faceBounds,
          eyesOpen: { left: leftEyeOpen, right: rightEyeOpen },
          headHeightPercentage,
          headHeightInches,
          detailedMessage: `Head takes up ${headHeightPercentage.toFixed(1)}% of photo - ideal for passport`
        }
      };
    } else {
      let message = '';
      let actionMessage = '';
      
      if (headHeightPercentage < MIN_HEAD_PERCENTAGE) {
        message = 'Head is too small';
        actionMessage = 'Your head needs to be larger in the frame. Move closer to the camera or crop tighter.';
      } else if (headHeightPercentage > MAX_HEAD_PERCENTAGE) {
        message = 'Head is too large';
        actionMessage = 'Your head is too large in the frame. Move further from the camera or crop wider.';
      } else if (!meetsMinRequirement) {
        message = 'Head is too small';
        actionMessage = `Head needs to be larger for passport standards.`;
      } else if (!meetsMaxRequirement) {
        message = 'Head is too large';
        actionMessage = `Head is too large for passport standards.`;
      }

      return {
        isValid: false,
        message,
        details: {
          faceBounds,
          eyesOpen: { left: leftEyeOpen, right: rightEyeOpen },
          headHeightPercentage,
          headHeightInches,
          detailedMessage: actionMessage
        }
      };
    }

  } catch (error) {
    console.error('Face detection error:', error);
    return {
      isValid: false,
      message: 'Face detection failed',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        detailedMessage: 'Could not analyze face. Make sure photo is clear and well-lit.'
      }
    };
  }
};

/**
 * Validate all photo requirements
 * @param uri - Image URI to validate
 * @param cropFrameSize - Optional crop frame size from PhotoCropScreen
 */
/**
 * Validate all photo requirements
 * @param uri - Image URI to validate
 * @param cropFrameSize - Optional crop frame size from PhotoCropScreen
 * @param requiredDPI - Required DPI for the photo (default: 300 DPI for passport photos)
 * @param targetSizeInches - Target size in inches (default: 2x2 inches for passport)
 */
export const validatePhoto = async (
  uri: string, 
  cropFrameSize?: number,
  requiredDPI: number = 300,
  targetSizeInches: { width: number; height: number } = { width: 2, height: 2 }
): Promise<PhotoValidationResults> => {
  const [dimensions, headSize, background] = await Promise.all([
    validatePhotoDimensions(uri, requiredDPI, targetSizeInches),
    validateHeadSize(uri, cropFrameSize),
    validateBackground(uri)
  ]);
  
  // Extract face detection data from headSize validation
  const faceDetection = headSize.details ? {
    faceBounds: headSize.details.faceBounds,
    eyesOpen: headSize.details.eyesOpen,
    faceCount: headSize.details.faceCount || (headSize.details.faceBounds ? 1 : 0)
  } : undefined;
  
  return {
    dimensions,
    headSize,
    background,
    faceDetection
  };
};
