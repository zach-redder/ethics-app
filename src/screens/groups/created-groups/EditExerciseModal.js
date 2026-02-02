import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../../constants';
import { exerciseService } from '../../../services';

/**
 * Edit Exercise Modal
 * Modal for editing exercise details
 */
export const EditExerciseModal = ({
  visible,
  exercise,
  onClose,
  onExerciseUpdated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateForDB = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  useEffect(() => {
    if (exercise) {
      setTitle(exercise.title || '');
      setDescription(exercise.description || '');
      setStartDate(
        exercise.start_date ? new Date(exercise.start_date) : null
      );
      setEndDate(
        exercise.end_date ? new Date(exercise.end_date) : null
      );
      setFrequency(exercise.frequency_per_day?.toString() || '');
      setInstructions(exercise.instructions || '');
      setNumberOfDays(exercise.number_of_days?.toString() || '');
    }
  }, [exercise]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter both start and end dates');
      return;
    }

    const startDateDB = formatDateForDB(startDate);
    const endDateDB = formatDateForDB(endDate);

    setLoading(true);
    try {
      const updates = {
        title: title.trim(),
        description: description.trim() || null,
        instructions: instructions.trim() || null,
        start_date: startDateDB,
        end_date: endDateDB,
        frequency_per_day: frequency ? parseInt(frequency) : null,
        number_of_days: numberOfDays ? parseInt(numberOfDays) : null,
      };

      const { error } = await exerciseService.updateExercise(
        exercise.id,
        updates
      );

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update exercise');
        return;
      }

      onExerciseUpdated();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update exercise');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Edit Exercise</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.section}>
            <TextInput
              style={styles.input}
              placeholder="Enter title..."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            <Text style={styles.label}>Date Range</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                  {startDate ? formatDate(startDate) : 'MM/DD/YYYY'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.dateSeparator}>to</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                  {endDate ? formatDate(endDate) : 'MM/DD/YYYY'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Frequency Per Day</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter frequency per day..."
              value={frequency}
              onChangeText={setFrequency}
              keyboardType="numeric"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            <Text style={styles.label}>Number of Days</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number of days to complete..."
              value={numberOfDays}
              onChangeText={setNumberOfDays}
              keyboardType="numeric"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter instructions..."
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.inputPlaceholder}
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {showStartPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
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
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
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
  contentContainer: {
    paddingBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  datePlaceholder: {
    color: COLORS.inputPlaceholder,
  },
  dateInput: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
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
  section: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateSeparator: {
    fontSize: 16,
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

