import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { MenuModal } from '../../../components';
import { InstructionsModal } from './InstructionsModal';
import { EditTimeframeModal } from './EditTimeframeModal';
import { exerciseProgressService } from '../../../services';

/**
 * Joined Exercise Menu Modal
 * Menu modal with options: View Instructions, Edit Timeframe, Share Exercise Notes
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

  return (
    <>
      <MenuModal
        visible={visible && !showInstructions && !showEditTimeframe}
        onClose={onClose}
        items={[
          { icon: 'eye', label: 'View Instructions', onPress: handleViewInstructions },
          { icon: 'pencil', label: 'Edit Timeframe', onPress: handleEditTimeframe },
          { icon: 'share-social-outline', label: sharing ? 'Preparing…' : 'Share Exercise Notes', onPress: handleShareNotes, disabled: sharing },
        ]}
      />

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
