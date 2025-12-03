/**
 * Theme Constants
 * Central place for colors, sizes, fonts, and other design tokens
 */

export const COLORS = {
  // Primary colors (from mockups)
  primary: '#1C5C7A',       // Dark teal button color
  secondary: '#3A5A6B',      // Secondary darker blue-gray

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  dark: '#1C1C1E',
  gray: '#8E8E93',
  lightGray: '#C7C7CC',
  background: '#E5E5E5',     // Light gray background from mockups

  // Semantic colors
  success: '#A8D5A8',        // Light green (Yes button)
  error: '#DC143C',          // Bright red (notification badge)
  errorLight: '#D5A8A8',     // Light red/pink (No button)
  warning: '#FF9500',
  info: '#1C5C7A',

  // Input colors
  inputBorder: '#D0D0D0',
  inputBackground: '#FFFFFF',
  inputPlaceholder: '#999999',
};

export const SIZES = {
  // Font sizes
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,

  // Spacing
  base: 8,
  padding: 12,
  margin: 16,

  // Border radius
  radius: 8,
  radiusLarge: 12,
  radiusRound: 999,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5.46,
    elevation: 5,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10.32,
    elevation: 10,
  },
};
