import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../../constants';
import { userExerciseCustomizationService } from '../../../services';

/**
 * Edit Timeframe Modal
 * Allows user to edit their personal timeframe within exercise bounds
 */
export const EditTimeframeModal = ({ visible, exercise, onClose, onTimeframeUpdated }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exercise) {
      const exerciseStart = new Date(exercise.start_date);
      const exerciseEnd = new Date(exercise.end_date);
      setStartDate(exerciseStart);
      setEndDate(exerciseEnd);
    }
  }, [exercise]);

  const formatDate = (date) => {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateForDB = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    // Validate dates are within exercise bounds
    const exerciseStart = new Date(exercise.start_date);
    const exerciseEnd = new Date(exercise.end_date);
    exerciseStart.setHours(0, 0, 0, 0);
    exerciseEnd.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate < exerciseStart || startDate > exerciseEnd) {
      Alert.alert('Error', 'Start date must be within the exercise date range');
      return;
    }

    if (endDate < exerciseStart || endDate > exerciseEnd) {
      Alert.alert('Error', 'End date must be within the exercise date range');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const { error } = await userExerciseCustomizationService.upsertCustomization(
        exercise.id,
        formatDateForDB(startDate),
        formatDateForDB(endDate)
      );

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update timeframe');
        return;
      }

      onTimeframeUpdated();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update timeframe');
    } finally {
      setLoading(false);
    }
  };

  if (!exercise) return null;

  const exerciseStart = new Date(exercise.start_date);
  const exerciseEnd = new Date(exercise.end_date);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Timeframe</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.infoText}>
            Select your preferred dates within the exercise range:
          </Text>
          <Text style={styles.rangeText}>
            {formatDate(exerciseStart)} - {formatDate(exerciseEnd)}
          </Text>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                {startDate ? formatDate(startDate) : 'MM/DD/YYYY'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateSeparator}>to</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                {endDate ? formatDate(endDate) : 'MM/DD/YYYY'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.closeButtonStyle]}
            onPress={onClose}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={startDate || exerciseStart}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={exerciseStart}
              maximumDate={exerciseEnd}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowStartPicker(false);
                }
                if (event.type === 'set' && selectedDate) {
                  setStartDate(selectedDate);
                  if (Platform.OS === 'ios') {
                    setShowStartPicker(false);
                  }
                } else if (event.type === 'dismissed') {
                  setShowStartPicker(false);
                }
              }}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setShowStartPicker(false)}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showEndPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={endDate || exerciseEnd}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={startDate || exerciseStart}
              maximumDate={exerciseEnd}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowEndPicker(false);
                }
                if (event.type === 'set' && selectedDate) {
                  setEndDate(selectedDate);
                  if (Platform.OS === 'ios') {
                    setShowEndPicker(false);
                  }
                } else if (event.type === 'dismissed') {
                  setShowEndPicker(false);
                }
              }}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setShowEndPicker(false)}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    padding: 4,
  },
  closeIcon: {
    fontSize: 36,
    color: COLORS.black,
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
  content: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  datePlaceholder: {
    color: COLORS.inputPlaceholder,
  },
  dateSeparator: {
    fontSize: 16,
    color: COLORS.black,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#A8D5A8',
  },
  saveButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonStyle: {
    backgroundColor: COLORS.errorLight,
  },
  closeButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  pickerDoneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  pickerDoneText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

