import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { notificationService } from '../../services';
import { BottomTabBar } from '../../components';

/**
 * Notification Settings Screen
 * Lets the user choose how many reminders per day (max 3)
 * and at which times.
 */
export const NotificationSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [frequency, setFrequency] = useState(1); // 1–3
  const [times, setTimes] = useState([
    { hour: 13, minute: 0 },
    { hour: 18, minute: 0 },
    { hour: 21, minute: 0 },
  ]);
  const [pickerState, setPickerState] = useState({
    visible: false,
    index: 0,
    date: new Date(),
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await notificationService.getUserNotificationSettings();
        if (error) {
          console.error('Load notification settings error:', error);
        } else if (data) {
          const safeFrequency = Math.min(Math.max(data.frequency_per_day || 1, 1), 3);
          const parseTime = (t, fallback) => {
            if (!t) return fallback;
            const [h, m] = t.split(':').map(Number);
            if (Number.isNaN(h) || Number.isNaN(m)) return fallback;
            return { hour: h, minute: m };
          };
          const defaults = [
            { hour: 13, minute: 0 },
            { hour: 18, minute: 0 },
            { hour: 21, minute: 0 },
          ];
          setFrequency(safeFrequency);
          setTimes([
            parseTime(data.time_1, defaults[0]),
            parseTime(data.time_2, defaults[1]),
            parseTime(data.time_3, defaults[2]),
          ]);
        }
      } catch (error) {
        console.error('Load notification settings error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const openPicker = (index) => {
    const t = times[index];
    const date = new Date();
    date.setHours(t.hour, t.minute, 0, 0);
    setPickerState({ visible: true, index, date });
  };

  const handleTimeChange = (_, selectedDate) => {
    // On Android, closing the picker should hide it immediately
    if (Platform.OS === 'android') {
      setPickerState((prev) => ({ ...prev, visible: false }));
    }
    // If the user cancelled the picker, do nothing
    if (!selectedDate) return;

    const { index } = pickerState;
    const updated = [...times];
    updated[index] = {
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes(),
    };
    setTimes(updated);
    // Keep pickerState.date in sync with the last chosen time
    setPickerState((prev) => ({ ...prev, date: selectedDate }));
  };

  const formatTimeLabel = ({ hour, minute }) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const clampedFrequency = Math.min(Math.max(frequency, 1), 3);

      const toTimeString = ({ hour, minute }) =>
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      const payload = {
        frequency_per_day: clampedFrequency,
        time_1: toTimeString(times[0]),
        time_2: clampedFrequency >= 2 ? toTimeString(times[1]) : null,
        time_3: clampedFrequency >= 3 ? toTimeString(times[2]) : null,
      };

      const { error } = await notificationService.updateUserNotificationSettings(payload);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to save notification settings');
        return;
      }

      // Reschedule notifications with new settings
      await notificationService.scheduleDailyNotifications();

      Alert.alert('Success', 'Notification settings updated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleManageSystemNotifications = () => {
    try {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else {
        Linking.openSettings();
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open system notification settings.');
    }
  };

  const renderFrequencyOption = (value) => {
    const isActive = frequency === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.freqOption, isActive && styles.freqOptionActive]}
        onPress={() => setFrequency(value)}
        activeOpacity={0.8}
      >
        <Text style={[styles.freqOptionText, isActive && styles.freqOptionTextActive]}>
          {value}x
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Manage notifications</Text>          
          <TouchableOpacity
            style={styles.manageSystemButton}
            onPress={handleManageSystemNotifications}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={18} color={COLORS.white} />
            <Text style={styles.manageSystemButtonText}>
              Open settings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reminders per day</Text>
          <Text style={styles.sectionSubtitle}>
            Choose how many times per day you&apos;d like to be reminded.
          </Text>
          <View style={styles.freqRow}>
            {[1, 2, 3].map(renderFrequencyOption)}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reminder times</Text>
          <Text style={styles.sectionSubtitle}>
            Set the times you&apos;d like to receive reminders.
          </Text>

          {[0, 1, 2].map((idx) => {
            const disabled = idx + 1 > frequency;
            return (
              <View key={idx} style={styles.timeRow}>
                <Text style={styles.timeLabel}>Time {idx + 1}</Text>
                <TouchableOpacity
                  style={[styles.timeButton, disabled && styles.timeButtonDisabled]}
                  onPress={() => !disabled && openPicker(idx)}
                  activeOpacity={disabled ? 1 : 0.8}
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      disabled && styles.timeButtonTextDisabled,
                    ]}
                  >
                    {formatTimeLabel(times[idx])}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {pickerState.visible && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={pickerState.date}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setPickerState((prev) => ({ ...prev, visible: false }))}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, (loading || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar navigation={navigation} activeScreen="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    padding: 4,
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
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingTop: 0,
    paddingBottom: 20,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  freqOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  freqOptionText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  freqOptionTextActive: {
    color: COLORS.white,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 15,
    color: COLORS.black,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.background,
  },
  timeButtonDisabled: {
    opacity: 0.5,
  },
  timeButtonText: {
    fontSize: 15,
    color: COLORS.black,
  },
  timeButtonTextDisabled: {
    color: COLORS.gray,
  },
  manageSystemButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  manageSystemButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
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

