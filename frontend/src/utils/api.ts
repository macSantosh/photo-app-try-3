import { API_BASE_URL } from './config';
import { ProcessedPhoto } from '../types';

export class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const logError = (error: unknown, context: string) => {
  if (error instanceof APIError) {
    console.error(`API Error [${error.statusCode}] in ${context}:`, error.message);
  } else if (error instanceof Error) {
    console.error(`Error in ${context}:`, error.message, error.stack);
  } else {
    console.error(`Unknown error in ${context}:`, error);
  }
};

export const processPhoto = async (photoUri: string): Promise<ProcessedPhoto> => {
  try {
    console.log('Processing photo:', photoUri);
    const formData = new FormData();
    const photo = {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any; // Type assertion needed for React Native's FormData
    formData.append('photo', photo);

    const response = await fetch(`${API_BASE_URL}/process-photo`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new APIError(response.status, errorText);
      logError(error, 'processPhoto');
      throw error;
    }

    const result = await response.json();
    console.log('Photo processed successfully:', result);
    return result;
  } catch (error) {
    logError(error, 'processPhoto');
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Failed to process photo: ' + (error as Error).message);
  }
};
