from pydantic import BaseModel
from typing import List

class PhotoDimensions(BaseModel):
    width: float
    height: float

class ProcessedPhoto(BaseModel):
    uri: str
    width: int
    height: int
    type: str
