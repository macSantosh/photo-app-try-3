import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// US Passport photo requirements (2x2 inches, head 1-1⅜ inches)
const PHOTO_RATIO = 1; // Square aspect ratio for passport photos
const FRAME_SIZE = Math.min(width, height - (height * 0.3));
const HEAD_OUTLINE_WIDTH = FRAME_SIZE;
const HEAD_OUTLINE_HEIGHT = FRAME_SIZE; // Square frame for passport photo

// Calculate frame position
const CENTER_X = width / 2;
const CENTER_Y = height / 2;

// Get frame dimensions and position
export const getFrameDimensions = () => {
  const frameLeft = (width - FRAME_SIZE) / 2;
  const frameTop = (height - FRAME_SIZE) / 2;

  return {
    frameSize: FRAME_SIZE,
    frameLeft,
    frameTop,
    centerX: CENTER_X,
    centerY: CENTER_Y,
    photoRatio: PHOTO_RATIO,
  };
};

// Calculate crop dimensions that ensure the frame area is captured
export const calculateCropDimensions = (photoWidth: number, photoHeight: number) => {
  const imageAspectRatio = photoWidth / photoHeight;
  let cropWidth: number;
  let cropHeight: number;
  let originX: number;
  let originY: number;

  // Calculate the target size (square for passport photos)
  const targetSize = Math.min(photoWidth, photoHeight);

  if (imageAspectRatio > 1) {
    // Image is wider
    cropHeight = targetSize;
    cropWidth = targetSize;
    originX = (photoWidth - cropWidth) / 2;
    originY = (photoHeight - cropHeight) / 2;
  } else {
    // Image is taller or square
    cropWidth = targetSize;
    cropHeight = targetSize;
    originX = (photoWidth - cropWidth) / 2;
    originY = (photoHeight - cropHeight) / 2;
  }

  // Safety checks to ensure crop dimensions don't exceed image bounds
  cropWidth = Math.min(cropWidth, photoWidth);
  cropHeight = Math.min(cropHeight, photoHeight);
  originX = Math.max(0, Math.min(originX, photoWidth - cropWidth));
  originY = Math.max(0, Math.min(originY, photoHeight - cropHeight));

  return {
    cropWidth,
    cropHeight,
    originX,
    originY,
  };
};
