export type RootStackParamList = {
  Upload: { photoUri?: string } | undefined;
  Camera: undefined;
};

export interface PhotoDimensions {
  width: number;
  height: number;
}

export interface PhotoRequirements {
  dimensions: PhotoDimensions;
  backgroundColor: string;
  minResolution: number;
  fileFormat: string[];
}

export interface ProcessedPhoto {
  uri: string;
  width: number;
  height: number;
  type: string;
}
