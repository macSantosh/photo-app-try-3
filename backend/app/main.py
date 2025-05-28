from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import photo
from .utils.error_handlers import PhotoProcessingError, photo_exception_handler
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Photo App API",
    description="API for passport and visa photo processing",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(photo.router, prefix="/api/v1", tags=["photo"])

@app.get("/")
async def root():
    return {"message": "Welcome to Photo App API"}
