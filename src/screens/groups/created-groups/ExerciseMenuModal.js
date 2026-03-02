import React, { useState } from 'react';
import { MenuModal } from '../../../components';
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

  return (
    <>
      <MenuModal
        visible={visible && !showEditModal && !showDeleteModal}
        onClose={onClose}
        items={[
          { icon: 'pencil', label: 'Edit Exercise', onPress: handleEdit },
          { icon: 'trash', label: 'Delete Exercise', onPress: handleDelete, destructive: true },
        ]}
      />

      <EditExerciseModal
        visible={showEditModal}
        exercise={exercise}
        onClose={() => setShowEditModal(false)}
        onExerciseUpdated={() => {
          setShowEditModal(false);
          onExerciseUpdated();
        }}
      />

      <DeleteExerciseModal
        visible={showDeleteModal}
        exercise={exercise}
        onClose={() => setShowDeleteModal(false)}
        onExerciseDeleted={() => {
          setShowDeleteModal(false);
          onExerciseDeleted();
        }}
      />
    </>
  );
};
