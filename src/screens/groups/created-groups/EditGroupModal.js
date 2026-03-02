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
import { COLORS } from '../../../constants';
import { groupService } from '../../../services';
import { formatters } from '../../../utils';
import { ScreenHeader, DatePickerInput } from '../../../components';

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
        start_date: formatters.formatDateForDB(startDate),
        end_date: formatters.formatDateForDB(endDate),
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
        <ScreenHeader title="Edit Group" onBack={onClose} variant="modal" />

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
            <DatePickerInput
              value={startDate}
              onChange={setStartDate}
              open={showStartPicker}
              onOpen={() => { setShowEndPicker(false); setShowStartPicker(true); }}
              onClose={() => setShowStartPicker(false)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>End Date (optional)</Text>
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              open={showEndPicker}
              onOpen={() => { setShowStartPicker(false); setShowEndPicker(true); }}
              onClose={() => setShowEndPicker(false)}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
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

