import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { exerciseProgressService } from '../../../services';

/**
 * Day Notes Modal
 * Modal for entering notes and completing days
 */
export const DayNotesModal = ({ visible, exercise, day, onClose, onDayUpdated }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (day) {
      setNotes(day.notes || '');
    }
  }, [day]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCheck = async () => {
    setLoading(true);
    try {
      await exerciseProgressService.completeDay(exercise.id, day.dateStr);
      await exerciseProgressService.upsertProgress(exercise.id, day.dateStr, {
        notes: notes.trim() || null,
        is_completed: true,
      });
      onDayUpdated();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete day');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      await exerciseProgressService.clearDay(exercise.id, day.dateStr);
      onDayUpdated();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to clear day');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOne = async () => {
    if (exercise.frequency_per_day && day.completions >= exercise.frequency_per_day) {
      Alert.alert('Info', 'You have reached the required frequency for this day');
      return;
    }

    setLoading(true);
    try {
      // Add one completion
      const newCompletions = (day.completions || 0) + 1;
      const shouldComplete = exercise.frequency_per_day && newCompletions >= exercise.frequency_per_day;
      
      // Update progress with new completion count
      await exerciseProgressService.upsertProgress(exercise.id, day.dateStr, {
        notes: notes.trim() || null,
        number_of_completions: newCompletions,
        is_completed: shouldComplete,
      });
      
      onDayUpdated();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add completion');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      await exerciseProgressService.upsertProgress(exercise.id, day.dateStr, {
        notes: notes.trim() || null,
        number_of_completions: day.completions || 0,
        is_completed: day.isCompleted || false,
      });
      onDayUpdated();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save notes');
    } finally {
      setLoading(false);
    }
  };

  if (!day) return null;

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
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Day {day.dayNumber}</Text>
            <Text style={styles.date}>{formatDate(day.date)}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Enter notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={8}
            placeholderTextColor={COLORS.inputPlaceholder}
            textAlignVertical="top"
            onBlur={handleSaveNotes}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.undoButton]}
            onPress={handleUndo}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-undo" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={handleAddOne}
            disabled={loading || (exercise.frequency_per_day && day.completions >= exercise.frequency_per_day)}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>+1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.checkButton]}
            onPress={handleCheck}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
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
    marginBottom: 32,
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  date: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    minHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  undoButton: {
    backgroundColor: COLORS.gray,
  },
  addButton: {
    backgroundColor: '#A8D5A8',
  },
  checkButton: {
    backgroundColor: COLORS.black,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

