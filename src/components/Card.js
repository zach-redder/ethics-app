import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../constants';

/**
 * Card Component
 * Standard white card container with shadow and rounded corners.
 * @param {ReactNode} children
 * @param {object} style - Additional styles (e.g. to override marginBottom)
 * @param {number} padding - Inner padding (default 16)
 */
export const Card = ({ children, style, padding = 16 }) => (
  <View style={[styles.card, { padding }, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
});
