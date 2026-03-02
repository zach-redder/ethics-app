/**
 * Theme Constants
 * Central place for colors, sizes, fonts, and other design tokens
 */

export const COLORS = {
  // Primary colors
  primary: '#036616',      // Primary dark green button color
  
  // Secondary and accent colors
  secondary: '#bd1129',    // Red secondary color
  accent: '#3d8e29',       // Lighter green accent
  redSecondary: '#de1a24', // Alternative red for variety

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  dark: '#1C1C1E',
  gray: '#8E8E93',
  lightGray: '#C7C7CC',
  background: '#E5E5E5',     // Light gray background from mockups

  // Semantic colors (keep yes/no buttons the same)
  success: '#A8D5A8',        // Light green (Yes button - keep same)
  error: '#DC143C',          // Bright red (notification badge)
  errorLight: '#D5A8A8',     // Light red/pink (No button - keep same)
  warning: '#FF9500',

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
  radiusCard: 16,
  radiusRound: 999,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SHADOWS = {
  // Standard card shadow — used for white content cards
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Modal / overlay shadow
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  // Prominent raised elements
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10.32,
    elevation: 10,
  },
};
