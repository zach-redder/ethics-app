import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

/**
 * ScreenHeader Component
 * Consistent 3-column header row used across screens and modals.
 *
 * @param {string} title
 * @param {function} onBack - Called when back/close button is pressed
 * @param {'screen'|'modal'} variant - 'screen' shows arrow-back icon; 'modal' shows × text
 * @param {string} iconColor - Color for the back arrow (screen variant only, default COLORS.black)
 * @param {ReactNode} rightElement - Optional right-side content; renders placeholder if omitted
 */
export const ScreenHeader = ({
  title,
  onBack,
  variant = 'screen',
  iconColor = COLORS.black,
  rightElement,
  style,
}) => (
  <View style={[variant === 'screen' ? [styles.header, styles.headerScreen] : styles.header, style]}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      {variant === 'modal' ? (
        <Text style={styles.closeIcon}>×</Text>
      ) : (
        <Ionicons name="arrow-back" size={24} color={iconColor} />
      )}
    </TouchableOpacity>
    <Text style={styles.title} numberOfLines={1}>{title}</Text>
    {rightElement !== undefined ? rightElement : <View style={styles.placeholder} />}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerScreen: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    padding: 4,
  },
  closeIcon: {
    fontSize: 36,
    color: COLORS.secondary,
    fontWeight: '300',
    lineHeight: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
});
