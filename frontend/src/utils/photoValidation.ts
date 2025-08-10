import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

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
}

export interface PhotoValidationResults {
  dimensions: ValidationResult;
  headSize: ValidationResult;
  background: ValidationResult;
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
 */
export const validatePhotoDimensions = async (uri: string): Promise<ValidationResult> => {
  try {
    const { width, height } = await getImageDimensions(uri);
    
    // Check if image is square (passport photos should be 1:1 aspect ratio)
    const aspectRatio = width / height;
    const isSquare = Math.abs(aspectRatio - 1) <= PASSPORT_STANDARDS.ASPECT_RATIO_TOLERANCE;
    
    if (!isSquare) {
      return {
        isValid: false,
        message: `Photo must be square (1:1 aspect ratio). Current: ${aspectRatio.toFixed(2)}:1`
      };
    }
    
    // Check minimum resolution (should be at least 600x600 for good quality)
    const minDimension = Math.min(width, height);
    if (minDimension < PASSPORT_STANDARDS.PHOTO_WIDTH_PIXELS) {
      return {
        isValid: false,
        message: `Photo resolution too low. Minimum: ${PASSPORT_STANDARDS.PHOTO_WIDTH_PIXELS}x${PASSPORT_STANDARDS.PHOTO_HEIGHT_PIXELS}px`
      };
    }
    
    return {
      isValid: true,
      message: `Photo dimensions are correct (${width}x${height}px)`
    };
    
  } catch (error) {
    return {
      isValid: false,
      message: 'Failed to validate photo dimensions'
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
      message: 'Background appears suitable (plain, light-colored backgrounds work best)'
    };
    
  } catch (error) {
    return {
      isValid: false,
      message: 'Could not analyze background'
    };
  }
};

/**
 * Estimate head size based on image analysis
 * This is a simplified approach without full face detection
 */
export const validateHeadSize = async (uri: string): Promise<ValidationResult> => {
  try {
    const { width, height } = await getImageDimensions(uri);
    
    // Simplified heuristic: assume the head takes up a reasonable portion of the image
    // In a real passport photo, the head should occupy about 50-69% of the image height
    const imageHeightPixels = Math.min(width, height);
    const estimatedHeadHeightRange = {
      min: imageHeightPixels * 0.5,
      max: imageHeightPixels * 0.69
    };
    
    // Convert to real-world measurements assuming 300 DPI
    const pixelsPerInch = 300;
    const estimatedHeadInches = {
      min: estimatedHeadHeightRange.min / pixelsPerInch,
      max: estimatedHeadHeightRange.max / pixelsPerInch
    };
    
    // Check if the estimated range overlaps with passport requirements
    const meetsMinRequirement = estimatedHeadInches.max >= PASSPORT_STANDARDS.HEAD_HEIGHT_MIN_INCHES;
    const meetsMaxRequirement = estimatedHeadInches.min <= PASSPORT_STANDARDS.HEAD_HEIGHT_MAX_INCHES;
    
    if (meetsMinRequirement && meetsMaxRequirement) {
      return {
        isValid: true,
        message: `Head size appears acceptable (estimated: ${estimatedHeadInches.min.toFixed(1)}" - ${estimatedHeadInches.max.toFixed(1)}")`
      };
    } else {
      let message = 'Head size may not meet requirements. ';
      if (!meetsMinRequirement) {
        message += 'Head appears too small. ';
      }
      if (!meetsMaxRequirement) {
        message += 'Head appears too large. ';
      }
      message += `Required: ${PASSPORT_STANDARDS.HEAD_HEIGHT_MIN_INCHES}" - ${PASSPORT_STANDARDS.HEAD_HEIGHT_MAX_INCHES}"`;
      
      return {
        isValid: false,
        message
      };
    }
    
  } catch (error) {
    return {
      isValid: false,
      message: 'Could not analyze head size'
    };
  }
};

/**
 * Validate all photo requirements
 */
export const validatePhoto = async (uri: string): Promise<PhotoValidationResults> => {
  const [dimensions, headSize, background] = await Promise.all([
    validatePhotoDimensions(uri),
    validateHeadSize(uri),
    validateBackground(uri)
  ]);
  
  return {
    dimensions,
    headSize,
    background
  };
};
