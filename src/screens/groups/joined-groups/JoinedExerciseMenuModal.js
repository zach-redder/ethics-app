import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { InstructionsModal } from './InstructionsModal';
import { EditTimeframeModal } from './EditTimeframeModal';
import { exerciseProgressService, groupService } from '../../../services';

/**
 * Joined Exercise Menu Modal
 * Menu modal with options: View Instructions, Edit Timeframe
 */
export const JoinedExerciseMenuModal = ({
  visible,
  exercise,
  onClose,
  onTimeframeUpdated,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showEditTimeframe, setShowEditTimeframe] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleViewInstructions = () => {
    onClose();
    setShowInstructions(true);
  };

  const handleEditTimeframe = () => {
    onClose();
    setShowEditTimeframe(true);
  };

  const handleShareNotes = async () => {
    if (!exercise?.id) {
      Alert.alert('Error', 'Exercise information is missing.');
      return;
    }

    try {
      setSharing(true);

      const { data, error } = await exerciseProgressService.getProgressByExercise(
        exercise.id
      );

      if (error) {
        Alert.alert(
          'Error',
          error.message || 'Failed to load exercise notes for sharing.'
        );
        return;
      }

      const rowsWithNotes = (data || []).filter(
        (row) => row.notes && row.notes.trim().length > 0
      );

      if (rowsWithNotes.length === 0) {
        Alert.alert('No Notes', 'You have no notes for this exercise yet.');
        return;
      }

      const lines = [];
      lines.push(`Exercise: ${exercise.title}`);
      if (exercise.description) {
        lines.push(`Description: ${exercise.description}`);
      }
      lines.push('');
      lines.push('Notes by day:');

      rowsWithNotes.forEach((row) => {
        const date = new Date(row.practice_date);
        const formatted = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        lines.push(`- ${formatted}: ${row.notes}`);
      });

      const subject = `Notes for "${exercise.title}"`;
      const body = lines.join('\n');
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        Alert.alert(
          'Error',
          'No email application is available on this device.'
        );
        return;
      }

      onClose();
      await Linking.openURL(mailtoUrl);
    } catch (err) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to open email client for sharing notes.'
      );
    } finally {
      setSharing(false);
    }
  };

  const handleEmailAdmin = async () => {
    if (!exercise?.id || !exercise?.group_id) {
      Alert.alert('Error', 'Exercise information is missing.');
      return;
    }

    try {
      setSharing(true);

      const { data: adminEmail, error: emailError } = await groupService.getGroupAdminEmail(
        exercise.group_id
      );

      if (emailError || !adminEmail) {
        Alert.alert('Unable to Email Admin', 'Could not retrieve the admin\'s email. Please try again.');
        return;
      }

      const { data, error } = await exerciseProgressService.getProgressByExercise(exercise.id);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to load exercise notes.');
        return;
      }

      const rows = data || [];

      if (rows.length === 0) {
        Alert.alert('No Progress', 'You have no progress recorded for this exercise yet.');
        return;
      }

      const lines = [];
      lines.push(`Exercise: ${exercise.title}`);
      if (exercise.description) lines.push(`Description: ${exercise.description}`);
      lines.push('');
      lines.push('My progress by day:');
      lines.push('');

      rows.forEach((row) => {
        const date = new Date(row.practice_date);
        const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const completedLabel = row.is_completed
          ? `Yes (${row.number_of_completions} completion${row.number_of_completions !== 1 ? 's' : ''})`
          : row.number_of_completions > 0
            ? `No (${row.number_of_completions} completion${row.number_of_completions !== 1 ? 's' : ''})`
            : 'No';
        lines.push(`${formatted}:`);
        lines.push(`  Completed: ${completedLabel}`);
        if (row.notes && row.notes.trim().length > 0) {
          lines.push(`  Notes: ${row.notes.trim()}`);
        }
        lines.push('');
      });

      lines.push('---');
      lines.push('Sent via Ethics App');

      const subject = `Exercise Notes: ${exercise.title}`;
      const body = lines.join('\n');
      const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        Alert.alert('No Email App Found', 'No email application is available on this device.');
        return;
      }

      onClose();
      await Linking.openURL(mailtoUrl);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to open email client.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible && !showInstructions && !showEditTimeframe}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewInstructions}
              activeOpacity={0.7}
            >
              <Ionicons name="eye" size={20} color={COLORS.black} />
              <Text style={styles.menuItemText}>View Instructions</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditTimeframe}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={20} color={COLORS.black} />
              <Text style={styles.menuItemText}>Edit Timeframe</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleShareNotes}
              disabled={sharing}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={20} color={COLORS.black} />
              <Text style={styles.menuItemText}>
                {sharing ? 'Preparing…' : 'Share Exercise Notes'}
              </Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEmailAdmin}
              disabled={sharing}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.black} />
              <Text style={styles.menuItemText}>
                {sharing ? 'Preparing…' : 'Email Admin'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <InstructionsModal
        visible={showInstructions}
        exercise={exercise}
        onClose={() => setShowInstructions(false)}
      />

      <EditTimeframeModal
        visible={showEditTimeframe}
        exercise={exercise}
        onClose={() => setShowEditTimeframe(false)}
        onTimeframeUpdated={() => {
          setShowEditTimeframe(false);
          onTimeframeUpdated();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.black,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
});

