import { Dimensions } from 'react-native';

export const COLORS = {
  primary: {
    navy: '#001F3F',
    white: '#FFFFFF',
    lightGray: '#F0F0F0',
  },
  secondary: {
    darkGreen: '#006400',
    gold: '#FFD700',
    red: '#B22222',
    orange: '#FFA500',
  },
};

const { width, height } = Dimensions.get('window');

export const SCREEN = {
  width,
  height,
  padding: 20,
};

export const TYPOGRAPHY = {
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary.navy,
  },
  subHeader: {
    fontSize: 16,
    color: COLORS.primary.navy,
    opacity: 0.8,
  },
  requirements: {
    fontSize: 14,
    color: COLORS.primary.navy,
  },
};
