import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { InstructionsModal } from './InstructionsModal';
import { EditTimeframeModal } from './EditTimeframeModal';

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

  const handleViewInstructions = () => {
    onClose();
    setShowInstructions(true);
  };

  const handleEditTimeframe = () => {
    onClose();
    setShowEditTimeframe(true);
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

