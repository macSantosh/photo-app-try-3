# Photo Crop Guidelines - Scalable Design

## Overview

The PhotoCropScreen has been refactored to support multiple countries' passport photo requirements through a scalable component-based architecture.

## Key Components

### 1. CropOverlay Component (`/src/components/CropOverlay.tsx`)

A reusable component that handles all visual guidelines for photo cropping:

- **Crop Frame**: Displays the cropping boundary
- **Facial Guidelines**: Shows head position, chin line, eye level, and face oval
- **Dimension Indicators**: Displays photo size requirements (e.g., "51 mm × 51 mm")
- **Shadow Curtain**: Creates focus effect around crop area

```tsx
<CropOverlay
  cropFrameSize={cropFrameSize}
  containerHeight={SCREEN_HEIGHT * 0.4}
  showGuidelines={showGuidelines}
  guidelines={guidelinesConfig}
/>
```

### 2. Photo Guidelines Configuration (`/src/utils/photoGuidelines.ts`)

Centralized configuration for different countries' requirements:

```tsx
export const US_PASSPORT_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 50,      // 50% of crop frame width
    height: 70,     // 70% of crop frame height
    topOffset: 12,  // 12% from top
  },
  chinLine: {
    position: 18,   // 18% from bottom
    label: 'Chin',
  },
  // ... more guidelines
};
```

### 3. Country Selector Component (`/src/components/CountrySelector.tsx`)

A UI component for selecting different countries (ready for future integration):

```tsx
<CountrySelector
  selectedCountry={selectedCountry}
  onSelectCountry={setSelectedCountry}
  visible={true}
/>
```

## Supported Countries

The system currently supports guidelines for:

- **US** - 51mm × 51mm square format
- **UK** - 35mm × 45mm rectangular format  
- **Canada** - 50mm × 70mm rectangular format
- **EU** - 35mm × 45mm rectangular format (with French labels)
- **India** - 51mm × 51mm square format (adjusted proportions)
- **Australia** - 35mm × 45mm rectangular format
- **China** - 48mm × 33mm rectangular format (with Chinese labels)

## How to Add New Countries

### Step 1: Define Guidelines

Add new guidelines to `/src/utils/photoGuidelines.ts`:

```tsx
export const NEW_COUNTRY_GUIDELINES: GuidelineConfig = {
  faceOval: {
    width: 48,      // Adjust face area width
    height: 68,     // Adjust face area height  
    topOffset: 14,  // Adjust vertical position
  },
  chinLine: {
    position: 19,   // Chin position from bottom
    label: 'Chin',  // Localized label
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
    width: '50 mm',   // Photo width
    height: '70 mm',  // Photo height
  },
  colors: {
    frame: colors.primary.navy,
    guidelines: '#FFFFFF',
    labels: '#FFFFFF',
  },
};
```

### Step 2: Add to Country Map

```tsx
export const COUNTRY_GUIDELINES = {
  // ... existing countries
  NC: NEW_COUNTRY_GUIDELINES,
} as const;
```

### Step 3: Add Display Name

```tsx
const COUNTRY_NAMES = {
  // ... existing names
  NC: 'New Country',
} as const;
```

## Usage in PhotoCropScreen

The PhotoCropScreen now uses the guidelines through configuration:

```tsx
const [selectedCountry] = useState<CountryCode>('US');
const [guidelinesConfig] = useState<GuidelineConfig>(
  getGuidelinesByCountry(selectedCountry)
);

// In render:
<CropOverlay
  cropFrameSize={cropFrameSize}
  containerHeight={SCREEN_HEIGHT * 0.4}
  showGuidelines={showGuidelines}
  guidelines={guidelinesConfig}
/>
```

## Future Enhancements

### 1. Dynamic Country Selection

```tsx
const [selectedCountry, setSelectedCountry] = useState<CountryCode>('US');

// Update guidelines when country changes
useEffect(() => {
  const newGuidelines = getGuidelinesByCountry(selectedCountry);
  setGuidelinesConfig(newGuidelines);
}, [selectedCountry]);
```

### 2. Persistent User Preferences

```tsx
// Save selected country to AsyncStorage
const saveCountryPreference = async (country: CountryCode) => {
  await AsyncStorage.setItem('selectedCountry', country);
};

// Load on app start
const loadCountryPreference = async () => {
  const saved = await AsyncStorage.getItem('selectedCountry');
  return (saved as CountryCode) || 'US';
};
```

### 3. Additional Guideline Types

```tsx
export interface ExtendedGuidelineConfig extends GuidelineConfig {
  // Add more specific requirements
  shoulderLine?: {
    position: number;
    label: string;
  };
  earVisibility?: {
    required: boolean;
    label: string;
  };
  backgroundRequirements?: {
    color: string;
    uniformity: boolean;
  };
}
```

## Architecture Benefits

1. **Separation of Concerns**: Guidelines are separate from cropping logic
2. **Reusability**: CropOverlay can be used in other screens
3. **Scalability**: Easy to add new countries and requirements
4. **Maintainability**: Centralized configuration management
5. **Localization Ready**: Labels can be easily translated
6. **Type Safety**: Full TypeScript support with compile-time checks

## Migration from Old Code

The refactoring removed approximately 150 lines of repetitive guideline code from PhotoCropScreen and consolidated it into reusable components, making the codebase cleaner and more maintainable.

## Testing Different Countries

To test different countries during development:

```tsx
// In PhotoCropScreen.tsx, change the default:
const [selectedCountry] = useState<CountryCode>('UK'); // Test UK guidelines
const [selectedCountry] = useState<CountryCode>('EU'); // Test EU guidelines
```

This allows developers and designers to quickly preview how the guidelines look for different countries without building a full country selection UI first.
