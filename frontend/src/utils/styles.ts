import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768;

export const colors = {
  primary: {
    white: '#FFFFFF',
    navy: '#1A237E',
    gray: '#607D8B',
  },
  secondary: {
    sky: '#03A9F4',
    green: '#4CAF50',
    red: '#F44336',
    orange: '#FF9800',
  },
  text: {
    primary: '#1A237E',
    secondary: '#607D8B',
    light: '#FFFFFF',
    dark: '#333333',
  },
  background: {
    main: '#FFFFFF',
    light: '#F5F5F5',
    dark: '#1A237E',
  },
  border: {
    light: '#E0E0E0',
    medium: '#607D8B',
    dark: '#1A237E',
  }
};

export const typography = {
  fontFamily: {
    primary: 'System',  // System font will fallback to SF Pro on iOS, Roboto on Android
    secondary: 'System',
  },
  fontSize: {
    xs: isLargeScreen ? 14 : 12,
    sm: isLargeScreen ? 16 : 14,
    md: isLargeScreen ? 18 : 16,
    lg: isLargeScreen ? 24 : 20,
    xl: isLargeScreen ? 32 : 24,
    xxl: isLargeScreen ? 40 : 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  }
};

export const spacing = {
  xs: isLargeScreen ? 4 : 2,
  sm: isLargeScreen ? 8 : 4,
  md: isLargeScreen ? 16 : 8,
  lg: isLargeScreen ? 24 : 16,
  xl: isLargeScreen ? 32 : 24,
  xxl: isLargeScreen ? 48 : 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 5,
  },
};

export const layout = {
  maxWidth: 1200,
  containerPadding: isLargeScreen ? spacing.xl : spacing.md,
  headerHeight: isLargeScreen ? 80 : 60,
};

// Common style mixins
export const mixins = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
};
