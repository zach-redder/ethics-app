import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { userService } from '../../services';

const CONFIRMATION_TEXT = 'DELETE';

/**
 * Delete Account Modal
 * Simple popup modal for confirming account deletion
 */
export const DeleteAccountModal = ({ visible, onClose }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmationText !== CONFIRMATION_TEXT) {
      Alert.alert(
        'Invalid Confirmation',
        `Please type "${CONFIRMATION_TEXT}" to confirm account deletion.`
      );
      return;
    }

    // Delete account directly after confirmation text is entered
    setLoading(true);
    try {
      const { error } = await userService.deleteAccount();

      if (error) {
        setLoading(false);
        Alert.alert('Error', error.message || 'Failed to delete account');
        return;
      }

      // Account deletion successful - close modal immediately
      // User will be signed out and navigation will be handled by auth state change listener in App.js
      setConfirmationText('');
      onClose();
    } catch (error) {
      setLoading(false);
      // Ensure modal closes even on error
      try {
        Alert.alert('Error', error.message || 'Failed to delete account');
      } catch (alertError) {
        // If alert fails (e.g., user already signed out), just close modal
        setConfirmationText('');
        onClose();
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmationText('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
        disabled={loading}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <Ionicons name="warning" size={32} color={COLORS.error} />
              <Text style={styles.title}>Delete Account</Text>
            </View>

            <Text style={styles.message}>
              Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Type <Text style={styles.confirmationLabel}>{CONFIRMATION_TEXT}</Text> to confirm:
              </Text>
              <TextInput
                style={styles.input}
                value={confirmationText}
                onChangeText={setConfirmationText}
                placeholder={`Type "${CONFIRMATION_TEXT}"`}
                placeholderTextColor={COLORS.inputPlaceholder}
                autoCapitalize="characters"
                editable={!loading}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.deleteButton,
                  (loading || confirmationText !== CONFIRMATION_TEXT) && styles.deleteButtonDisabled,
                ]}
                onPress={handleDelete}
                disabled={loading || confirmationText !== CONFIRMATION_TEXT}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
  },
  confirmationLabel: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  cancelButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
