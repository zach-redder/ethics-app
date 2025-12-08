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
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { groupService } from '../../../services';

/**
 * Edit Group Modal
 * Modal for editing group details
 */

export const EditGroupModal = ({ visible, group, onClose, onGroupUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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
    if (group) {
      setName(group.name || '');
      setDescription(group.description || '');
      setStartDate(
        group.start_date ? new Date(group.start_date) : null
      );
      setEndDate(
        group.end_date ? new Date(group.end_date) : null
      );
    }
  }, [group]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        name: name.trim(),
        description: description.trim() || null,
        start_date: formatDateForDB(startDate),
        end_date: formatDateForDB(endDate),
      };

      const { error } = await groupService.updateGroup(group.id, updates);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update group');
        return;
      }

      onGroupUpdated();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update group');
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
          <Text style={styles.title}>Edit Group</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.field}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter group name"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.inputPlaceholder}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Start Date (optional)</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                {startDate ? formatDate(startDate) : 'MM/DD/YYYY'}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.black}
                style={styles.calendarIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>End Date (optional)</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                {endDate ? formatDate(endDate) : 'MM/DD/YYYY'}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.black}
                style={styles.calendarIcon}
              />
            </TouchableOpacity>
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    position: 'relative',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarIcon: {
    position: 'absolute',
    right: 12,
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

