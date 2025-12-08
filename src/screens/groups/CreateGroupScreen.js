import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { groupService } from '../../services';

/**
 * Create Group Screen
 */
export const CreateGroupScreen = ({ navigation, route }) => {
  const [groupName, setGroupName] = useState('');
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

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      const groupData = {
        name: groupName.trim(),
        description: description.trim() || null,
        start_date: formatDateForDB(startDate),
        end_date: formatDateForDB(endDate),
      };

      const { data, error } = await groupService.createGroup(groupData);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Group created, trigger adds owner as member automatically
        // Navigate to confirmation
        navigation.navigate('GroupConfirmation', {
          group: data,
          isCreator: true,
        });
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (route?.params?.fromDashboard) {
                navigation.navigate('Dashboard');
              } else {
                navigation.goBack();
              }
            }}
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Group</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Group Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter name..."
              placeholderTextColor={COLORS.inputPlaceholder}
              value={groupName}
              onChangeText={setGroupName}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description..."
              placeholderTextColor={COLORS.inputPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Start Date (optional)</Text>
          <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
              {startDate ? formatDate(startDate) : 'MM/DD/YYYY'}
            </Text>
            <Ionicons name="calendar-outline" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setStartDate(selectedDate);
                }
              }}
            />
          )}

          <Text style={styles.label}>End Date (optional)</Text>
          <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
              {endDate ? formatDate(endDate) : 'MM/DD/YYYY'}
            </Text>
            <Ionicons name="calendar-outline" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setEndDate(selectedDate);
                }
              }}
            />
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateGroup}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Group'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  closeButton: {
    marginRight: 16,
    padding: 4,
  },
  closeIcon: {
    fontSize: 36,
    color: COLORS.black,
    fontWeight: '300',
    lineHeight: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: COLORS.black,
  },
  textAreaContainer: {
    minHeight: 120,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholderText: {
    color: COLORS.inputPlaceholder,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
