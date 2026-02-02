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
  const [daysError, setDaysError] = useState(null);
  const [customization, setCustomization] = useState(null);

  // Helper function to parse date string to local date (avoiding timezone issues)
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    // Parse YYYY-MM-DD format and create date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Load existing customization when modal opens
  useEffect(() => {
    const loadCustomization = async () => {
      if (exercise && visible) {
        try {
          const result = await userExerciseCustomizationService.getCustomization(exercise.id);
          if (result.data) {
            setCustomization(result.data);
            // Use saved customization dates
            const customStart = parseLocalDate(result.data.custom_start_date);
            const customEnd = parseLocalDate(result.data.custom_end_date);
            if (customStart && customEnd) {
              setStartDate(customStart);
              setEndDate(customEnd);
            }
          } else {
            // No customization exists, use exercise defaults
            setCustomization(null);
            const exerciseStart = parseLocalDate(exercise.start_date);
            const exerciseEnd = parseLocalDate(exercise.end_date);
            if (exerciseStart && exerciseEnd) {
              setStartDate(exerciseStart);
              // If number_of_days is set, calculate end date based on it
              if (exercise.number_of_days) {
                const calculatedEnd = new Date(exerciseStart);
                calculatedEnd.setDate(calculatedEnd.getDate() + exercise.number_of_days - 1);
                calculatedEnd.setHours(0, 0, 0, 0);
                // Make sure it doesn't exceed exercise end date
                const maxEnd = parseLocalDate(exercise.end_date);
                if (calculatedEnd <= maxEnd) {
                  setEndDate(calculatedEnd);
                } else {
                  setEndDate(maxEnd);
                }
              } else {
                setEndDate(exerciseEnd);
              }
            }
          }
          setDaysError(null);
        } catch (error) {
          console.error('Error loading customization:', error);
          // Fallback to exercise dates on error
          const exerciseStart = parseLocalDate(exercise.start_date);
          const exerciseEnd = parseLocalDate(exercise.end_date);
          if (exerciseStart && exerciseEnd) {
            setStartDate(exerciseStart);
            setEndDate(exerciseEnd);
          }
        }
      } else if (!visible) {
        // Reset state when modal closes
        setStartDate(null);
        setEndDate(null);
        setDaysError(null);
        setCustomization(null);
      }
    };

    loadCustomization();
  }, [exercise, visible]);

  const formatDate = (date) => {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateForDB = (date) => {
    if (!date) return null;
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate number of days between two dates (inclusive)
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 to include both start and end dates
  };

  // Auto-adjust end date when start date changes
  const handleStartDateChange = (selectedDate) => {
    if (!selectedDate) return;
    
    const newStart = new Date(selectedDate);
    newStart.setHours(0, 0, 0, 0);
    setStartDate(newStart);
    
    // If number_of_days is required, auto-calculate end date
    if (exercise?.number_of_days) {
      const exerciseStart = parseLocalDate(exercise.start_date);
      const exerciseEnd = parseLocalDate(exercise.end_date);
      
      const calculatedEnd = new Date(newStart);
      calculatedEnd.setDate(calculatedEnd.getDate() + exercise.number_of_days - 1);
      calculatedEnd.setHours(0, 0, 0, 0);
      
      // Make sure calculated end date is within exercise bounds
      const endTime = exerciseEnd.getTime();
      const calcTime = calculatedEnd.getTime();
      const startTime = newStart.getTime();
      
      if (calcTime <= endTime && calcTime >= startTime) {
        setEndDate(calculatedEnd);
        setDaysError(null);
      } else {
        // If it exceeds bounds, set to exercise end and show error
        setEndDate(exerciseEnd);
        const actualDays = calculateDays(newStart, exerciseEnd);
        if (actualDays !== exercise.number_of_days) {
          setDaysError(`Selected start date doesn't allow ${exercise.number_of_days} days. Maximum available: ${actualDays} days.`);
        }
      }
    }
  };

  // Validate end date when it changes
  const handleEndDateChange = (selectedDate) => {
    if (!selectedDate) return;
    
    const newEnd = new Date(selectedDate);
    newEnd.setHours(0, 0, 0, 0);
    setEndDate(newEnd);
    
    // Validate number of days if required
    if (exercise?.number_of_days && startDate) {
      const actualDays = calculateDays(startDate, newEnd);
      if (actualDays !== exercise.number_of_days) {
        setDaysError(`Timeframe must be exactly ${exercise.number_of_days} days. Currently: ${actualDays} days.`);
      } else {
        setDaysError(null);
      }
    }
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    // Validate dates are within exercise bounds
    const exerciseStart = parseLocalDate(exercise.start_date);
    const exerciseEnd = parseLocalDate(exercise.end_date);
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(0, 0, 0, 0);

    if (normalizedStart < exerciseStart || normalizedStart > exerciseEnd) {
      Alert.alert('Error', 'Start date must be within the exercise date range');
      return;
    }

    if (normalizedEnd < exerciseStart || normalizedEnd > exerciseEnd) {
      Alert.alert('Error', 'End date must be within the exercise date range');
      return;
    }

    if (normalizedEnd < normalizedStart) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    // Validate number of days if required
    if (exercise.number_of_days) {
      const actualDays = calculateDays(normalizedStart, normalizedEnd);
      if (actualDays !== exercise.number_of_days) {
        Alert.alert(
          'Invalid Timeframe',
          `This exercise requires exactly ${exercise.number_of_days} days. Your selected timeframe is ${actualDays} days. Please adjust your dates.`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await userExerciseCustomizationService.upsertCustomization(
        exercise.id,
        formatDateForDB(normalizedStart),
        formatDateForDB(normalizedEnd)
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

  const exerciseStart = parseLocalDate(exercise.start_date);
  const exerciseEnd = parseLocalDate(exercise.end_date);

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

          {exercise.number_of_days && (
            <View style={styles.requirementContainer}>
              <Text style={styles.requirementText}>
                <Text style={styles.requirementBold}>Required: {exercise.number_of_days} days</Text>
              </Text>
              {startDate && endDate && (
                <Text style={styles.currentDaysText}>
                  Your timeframe: {calculateDays(startDate, endDate)} days
                </Text>
              )}
            </View>
          )}
          
          {!exercise.number_of_days && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>No specific day requirement</Text>
              <Text style={styles.infoSubtext}>You can choose any date range within the exercise period</Text>
            </View>
          )}

          {daysError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{daysError}</Text>
            </View>
          )}

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setShowEndPicker(false);
                setShowStartPicker(true);
              }}
            >
              <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                {startDate ? formatDate(startDate) : 'MM/DD/YYYY'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateSeparator}>to</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setShowStartPicker(false);
                setShowEndPicker(true);
              }}
            >
              <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                {endDate ? formatDate(endDate) : 'MM/DD/YYYY'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, (loading || daysError) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading || !!daysError}
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
              value={startDate || exerciseStart || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={exerciseStart}
              maximumDate={
                exercise.number_of_days
                  ? (() => {
                      const maxStart = new Date(exerciseEnd);
                      maxStart.setDate(maxStart.getDate() - exercise.number_of_days + 1);
                      maxStart.setHours(0, 0, 0, 0);
                      return maxStart < exerciseStart ? exerciseStart : maxStart;
                    })()
                  : exerciseEnd
              }
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowStartPicker(false);
                }
                if (event.type === 'set' && selectedDate) {
                  handleStartDateChange(selectedDate);
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
              value={endDate || exerciseEnd || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={startDate || exerciseStart}
              maximumDate={
                exercise.number_of_days && startDate
                  ? (() => {
                      const maxEnd = new Date(startDate);
                      maxEnd.setDate(maxEnd.getDate() + exercise.number_of_days - 1);
                      maxEnd.setHours(0, 0, 0, 0);
                      return maxEnd > exerciseEnd ? exerciseEnd : maxEnd;
                    })()
                  : exerciseEnd
              }
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowEndPicker(false);
                }
                if (event.type === 'set' && selectedDate) {
                  handleEndDateChange(selectedDate);
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
    marginBottom: 16,
  },
  requirementContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  requirementBold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  currentDaysText: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: COLORS.gray,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
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
    marginBottom: 40,
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonStyle: {
    backgroundColor: COLORS.secondary,
  },
  closeButtonText: {
    color: COLORS.white,
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

