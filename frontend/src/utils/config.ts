import { PhotoRequirements } from '../types';

export const US_PASSPORT_REQUIREMENTS: PhotoRequirements = {
  dimensions: {
    width: 2, // inches
    height: 2, // inches
  },
  backgroundColor: '#FFFFFF',
  minResolution: 300, // DPI
  fileFormat: ['jpg', 'jpeg'],
};

export const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

export const PHOTO_GUIDELINES = {
  face: {
    minHeight: '1 inch',
    maxHeight: '1 3/8 inches',
    expression: 'Neutral expression, both eyes open',
    glasses: 'No glare, no tinted lenses',
  },
  background: {
    color: 'Plain white or off-white',
    pattern: 'No patterns or shadows',
  },
  attire: {
    type: 'Normal civilian clothing',
    restrictions: 'No uniforms, no head coverings (except religious)',
  },
};
