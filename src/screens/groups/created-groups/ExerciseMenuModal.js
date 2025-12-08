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
import { EditExerciseModal } from './EditExerciseModal';
import { DeleteExerciseModal } from './DeleteExerciseModal';

/**
 * Exercise Menu Modal
 * Menu modal with options: Edit Exercise, Delete Exercise
 */
export const ExerciseMenuModal = ({
  visible,
  exercise,
  onClose,
  onExerciseUpdated,
  onExerciseDeleted,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    onClose();
    setShowEditModal(true);
  };

  const handleDelete = () => {
    onClose();
    setShowDeleteModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onExerciseUpdated();
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    onExerciseDeleted();
  };

  return (
    <>
      <Modal
        visible={visible && !showEditModal && !showDeleteModal}
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
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={20} color={COLORS.black} />
              <Text style={styles.menuItemText}>Edit Exercise</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, styles.deleteText]}>
                Delete Exercise
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <EditExerciseModal
        visible={showEditModal}
        exercise={exercise}
        onClose={handleEditClose}
        onExerciseUpdated={handleEditSuccess}
      />

      <DeleteExerciseModal
        visible={showDeleteModal}
        exercise={exercise}
        onClose={handleDeleteClose}
        onExerciseDeleted={handleDeleteSuccess}
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
  deleteText: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
});

