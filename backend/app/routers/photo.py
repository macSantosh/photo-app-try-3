from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.photo_service import PhotoService
from ..models.photo import ProcessedPhoto
from ..utils.error_handlers import PhotoProcessingError
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/process-photo", response_model=ProcessedPhoto)
async def process_photo(photo: UploadFile = File(...)):
    try:
        logger.info(f"Processing photo: {photo.filename}")
        # Create temp directory if it doesn't exist
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        # Save uploaded file
        file_path = temp_dir / photo.filename
        with open(file_path, "wb") as buffer:
            content = await photo.read()
            buffer.write(content)
        
        # Process the photo
        photo_service = PhotoService()
        processed_path, width, height = photo_service.process_photo(str(file_path))
        
        return ProcessedPhoto(
            uri=str(processed_path),
            width=width,
            height=height,
            type="image/jpeg"
        )
    except Exception as e:
        logger.error(f"Error processing photo {photo.filename}: {str(e)}", exc_info=True)
        raise PhotoProcessingError(
            message=f"Failed to process photo: {str(e)}",
            status_code=500
        )
    finally:
        # Cleanup
        try:
            if file_path.exists():
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.error(f"Error cleaning up file {file_path}: {str(e)}", exc_info=True)
