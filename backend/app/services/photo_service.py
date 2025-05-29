import cv2
import numpy as np
import os
from pathlib import Path
from typing import Tuple
import logging
from PIL import Image
from ..utils.error_handlers import PhotoProcessingError

logger = logging.getLogger(__name__)

class PhotoService:
    PASSPORT_WIDTH_PIXELS = 600  # 2 inches at 300 DPI
    PASSPORT_HEIGHT_PIXELS = 600  # 2 inches at 300 DPI
    MIN_FACE_HEIGHT_PIXELS = 300  # 1 inch at 300 DPI
    MAX_FACE_HEIGHT_PIXELS = 420  # 1 3/8 inches at 300 DPI

    @staticmethod
    def process_photo(file_path: str) -> Tuple[str, int, int]:
        """
        Process the photo according to passport requirements:
        - Convert to correct dimensions (2x2 inches at 300 DPI)
        - Detect and validate face size (1-1⅜ inches)
        - Ensure white background
        - Center the face in the frame
        
        Args:
            file_path: Path to the input image file
            
        Returns:
            Tuple containing (output_path, width, height)
            
        Raises:
            PhotoProcessingError: If there's an error processing the image
        """
        logger.info(f"Starting photo processing for file: {file_path}")
        
        try:
            # Read image
            image = cv2.imread(file_path)
            if image is None:
                raise PhotoProcessingError("Could not read image file", 400)
                
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect face
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(
                cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY),
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(200, 200)
            )
            
            if len(faces) == 0:
                raise PhotoProcessingError("No face detected in the image", 400)
            elif len(faces) > 1:
                raise PhotoProcessingError("Multiple faces detected in the image", 400)
                
            # Get face dimensions
            x, y, w, h = faces[0]
            
            # Check face size ratio
            if h < PhotoService.MIN_FACE_HEIGHT_PIXELS or h > PhotoService.MAX_FACE_HEIGHT_PIXELS:
                raise PhotoProcessingError(
                    "Face height must be between 1 inch and 1⅜ inches when printed at 300 DPI",
                    400
                )
            
            # Calculate crop area to maintain aspect ratio and center face
            center_x = x + w/2
            center_y = y + h/2
            crop_size = max(PhotoService.PASSPORT_WIDTH_PIXELS, PhotoService.PASSPORT_HEIGHT_PIXELS)
            
            crop_x = int(center_x - crop_size/2)
            crop_y = int(center_y - crop_size/2)
            
            # Ensure crop boundaries are within image
            height, width = image_rgb.shape[:2]
            crop_x = max(0, min(crop_x, width - crop_size))
            crop_y = max(0, min(crop_y, height - crop_size))
            
            # Crop image
            cropped = image_rgb[crop_y:crop_y+crop_size, crop_x:crop_x+crop_size]
            
            # Resize to passport photo size
            resized = cv2.resize(cropped, (PhotoService.PASSPORT_WIDTH_PIXELS, PhotoService.PASSPORT_HEIGHT_PIXELS))
            
            # Convert to PIL Image for saving
            pil_image = Image.fromarray(resized)
            
            # Save processed image
            output_path = str(Path(file_path).parent / f"{Path(file_path).stem}_processed.jpg")
            pil_image.save(output_path, "JPEG", quality=95, dpi=(300, 300))
            
            return output_path, PhotoService.PASSPORT_WIDTH_PIXELS, PhotoService.PASSPORT_HEIGHT_PIXELS
            
        except PhotoProcessingError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error processing photo: {str(e)}", exc_info=True)
            raise PhotoProcessingError(f"Failed to process photo: {str(e)}", 500)
