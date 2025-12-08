import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants';
import { groupMemberService } from '../../../services';

/**
 * Delete Member Modal
 * Confirmation modal for removing a member from a group
 */
export const DeleteMemberModal = ({
  visible,
  member,
  groupId,
  onClose,
  onMemberDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!member || !member.user_id) {
      Alert.alert('Error', 'Invalid member');
      return;
    }

    setLoading(true);
    try {
      const { error } = await groupMemberService.removeMember(
        groupId,
        member.user_id
      );

      if (error) {
        Alert.alert('Error', error.message || 'Failed to remove member');
        setLoading(false);
        return;
      }

      onMemberDeleted();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to remove member');
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Are you sure you want to remove?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={handleDelete}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.yesButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.noButton]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.noButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: COLORS.success,
  },
  yesButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  noButton: {
    backgroundColor: COLORS.errorLight,
  },
  noButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
});

