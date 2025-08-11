import { GuidelineConfig } from '../components/CropOverlay';
import { colors } from './styles';

// US Passport Photo Guidelines (Current Implementation)
export const US_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 50, // 50% of crop frame width
    height: 70, // 70% of crop frame height
    topOffset: 12, // 12% from top
  },
  chinLine: {
    position: 18, // 18% from bottom
    label: 'Chin',
  },
  headTopLine: {
    position: 12, // 12% from top
    label: 'Top of Head',
  },
  eyeLine: {
    position: 50, // 50% from bottom (center)
    label: 'Eye Level',
  },
  dimensions: {
    width: '51 mm',
    height: '51 mm',
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};

// UK Passport Photo Guidelines
export const UK_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 45, // Slightly smaller face area
    height: 65, // Different proportions
    topOffset: 15, // More space at top
  },
  chinLine: {
    position: 20, // Different chin positioning
    label: 'Chin',
  },
  headTopLine: {
    position: 15, // More space from top
    label: 'Top of Head',
  },
  eyeLine: {
    position: 55, // Eyes positioned higher
    label: 'Eye Level',
  },
  dimensions: {
    width: '35 mm',
    height: '45 mm', // UK uses rectangular format
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};

// Canadian Passport Photo Guidelines
export const CANADA_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 48,
    height: 68,
    topOffset: 14,
  },
  chinLine: {
    position: 19,
    label: 'Chin',
  },
  headTopLine: {
    position: 14,
    label: 'Top of Head',
  },
  eyeLine: {
    position: 52,
    label: 'Eye Level',
  },
  dimensions: {
    width: '50 mm',
    height: '70 mm',
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};

// European Union (Schengen) Guidelines
export const EU_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 46,
    height: 66,
    topOffset: 15,
  },
  chinLine: {
    position: 21,
    label: 'Menton', // French for chin
  },
  headTopLine: {
    position: 15,
    label: 'Sommet de la tête', // French for top of head
  },
  eyeLine: {
    position: 54,
    label: 'Niveau des yeux', // French for eye level
  },
  dimensions: {
    width: '35 mm',
    height: '45 mm',
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};

// India Passport Photo Guidelines
export const INDIA_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 52, // Slightly larger face area
    height: 72,
    topOffset: 10, // Less space at top
  },
  chinLine: {
    position: 16,
    label: 'Chin',
  },
  headTopLine: {
    position: 10,
    label: 'Top of Head',
  },
  eyeLine: {
    position: 48,
    label: 'Eye Level',
  },
  dimensions: {
    width: '51 mm',
    height: '51 mm',
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};

// Australia Passport Photo Guidelines
export const AUSTRALIA_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 47,
    height: 67,
    topOffset: 13,
  },
  chinLine: {
    position: 18,
    label: 'Chin',
  },
  headTopLine: {
    position: 13,
    label: 'Top of Head',
  },
  eyeLine: {
    position: 51,
    label: 'Eye Level',
  },
  dimensions: {
    width: '35 mm',
    height: '45 mm',
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};

// China Passport Photo Guidelines
export const CHINA_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 49,
    height: 69,
    topOffset: 12,
  },
  chinLine: {
    position: 17,
    label: '下巴', // Chinese for chin
  },
  headTopLine: {
    position: 12,
    label: '头顶', // Chinese for top of head
  },
  eyeLine: {
    position: 49,
    label: '眼线', // Chinese for eye level
  },
  dimensions: {
    width: '48 mm',
    height: '33 mm',
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};

// Map of country codes to guidelines
export const COUNTRY_GUIDELINES = {
  US: US_PASSPORT_GUIDELINES,
  UK: UK_PASSPORT_GUIDELINES,
  CA: CANADA_PASSPORT_GUIDELINES,
  EU: EU_PASSPORT_GUIDELINES,
  IN: INDIA_PASSPORT_GUIDELINES,
  AU: AUSTRALIA_PASSPORT_GUIDELINES,
  CN: CHINA_PASSPORT_GUIDELINES,
} as const;

export type CountryCode = keyof typeof COUNTRY_GUIDELINES;

// Helper function to get guidelines by country code
export const getGuidelinesByCountry = (countryCode: CountryCode): GuidelineConfig => {
  return COUNTRY_GUIDELINES[countryCode] || US_PASSPORT_GUIDELINES;
};

// Default export for backwards compatibility
export default US_PASSPORT_GUIDELINES;
