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
import { EditGroupModal } from './EditGroupModal';
import { DeleteGroupModal } from './DeleteGroupModal';

/**
 * Group Settings Modal
 * Menu modal with options: Edit Group, Manage Members, Delete Group
 */
export const GroupSettingsModal = ({
  visible,
  group,
  onClose,
  onGroupUpdated,
  onGroupDeleted,
  navigation,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    onClose();
    setShowEditModal(true);
  };

  const handleManageMembers = () => {
    onClose();
    navigation.navigate('ManageMembers', { groupId: group.id });
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
    onGroupUpdated();
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    onGroupDeleted();
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
              <Text style={styles.menuItemText}>Edit Group</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleManageMembers}
              activeOpacity={0.7}
            >
              <Ionicons name="people" size={20} color={COLORS.black} />
              <Text style={styles.menuItemText}>Manage Members</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, styles.deleteText]}>
                Delete Group
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <EditGroupModal
        visible={showEditModal}
        group={group}
        onClose={handleEditClose}
        onGroupUpdated={handleEditSuccess}
      />

      <DeleteGroupModal
        visible={showDeleteModal}
        group={group}
        onClose={handleDeleteClose}
        onGroupDeleted={handleDeleteSuccess}
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

