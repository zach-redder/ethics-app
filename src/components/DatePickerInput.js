import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { formatters } from '../utils';

/**
 * DatePickerCard
 * Floating picker UI (DateTimePicker + iOS Done button). Use this when the picker
 * needs to render outside a flex row — e.g. below a dateRow containing two triggers.
 *
 * @param {Date|null} value
 * @param {function} onChange - Called with Date on confirmed selection
 * @param {function} onClose
 * @param {Date} [minimumDate]
 * @param {Date} [maximumDate]
 * @param {'spinner'|'inline'} [display='spinner']
 */
export const DatePickerCard = ({
  value,
  onChange,
  onClose,
  minimumDate,
  maximumDate,
  display = 'spinner',
}) => {
  const safeValue = value instanceof Date && !isNaN(value.getTime()) ? value : new Date();

  const handleChange = (event, selectedDate) => {
    const type = event.type || event?.nativeEvent?.type;
    if (type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
    // Close the picker after any interaction on Android (it's a dialog),
    // after a dismiss on either platform, or after a date tap in inline mode on iOS.
    if (
      Platform.OS === 'android' ||
      type === 'dismissed' ||
      (Platform.OS === 'ios' && display === 'inline' && type === 'set')
    ) {
      onClose();
    }
  };

  return (
    <View style={styles.pickerCard}>
      <DateTimePicker
        value={safeValue}
        mode="date"
        display={Platform.OS === 'ios' ? display : 'default'}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={handleChange}
      />
      {Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * DatePickerInput
 * Self-contained date field: trigger button + inline picker card. Use this for
 * standalone (non-row) date fields where the picker can render directly below.
 *
 * @param {Date|null} value
 * @param {function} onChange - Called with Date on confirmed selection
 * @param {boolean} open - Controlled open state
 * @param {function} onOpen - Called when trigger is pressed
 * @param {function} onClose - Called when picker closes
 * @param {string} [placeholder='MM/DD/YYYY']
 * @param {Date} [minimumDate]
 * @param {Date} [maximumDate]
 * @param {'spinner'|'inline'} [display='spinner']
 * @param {boolean} [showIcon=true]
 * @param {object} [style] - Override style for the trigger container
 */
export const DatePickerInput = ({
  value,
  onChange,
  open,
  onOpen,
  onClose,
  placeholder = 'MM/DD/YYYY',
  minimumDate,
  maximumDate,
  display = 'spinner',
  showIcon = true,
  style,
}) => (
  <>
    <TouchableOpacity style={[styles.container, style]} onPress={onOpen} activeOpacity={0.7}>
      <Text style={[styles.text, !value && styles.placeholder]}>
        {value ? formatters.formatDatePicker(value) : placeholder}
      </Text>
      {showIcon && <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />}
    </TouchableOpacity>
    {open && (
      <DatePickerCard
        value={value}
        onChange={onChange}
        onClose={onClose}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        display={display}
      />
    )}
  </>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  text: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholder: {
    color: COLORS.inputPlaceholder,
  },
  pickerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    marginTop: 8,
    ...SHADOWS.medium,
    zIndex: 1000,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 16,
  },
  doneText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
