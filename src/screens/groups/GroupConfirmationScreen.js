import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants';

/**
 * Group Confirmation Screen - Confirm group details
 */
export const GroupConfirmationScreen = ({ navigation, route }) => {
  const { group, isCreator } = route.params || {};

  const handleConfirm = () => {
    // Navigate to dashboard
    navigation.navigate('Dashboard', {
      initialTab: isCreator ? 'created' : 'joined',
      fromOnboarding: true, // Flag to indicate first time reaching dashboard
    });
  };

  const handleReject = () => {
    // Go back to create/join selection
    navigation.navigate('GroupChoice');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Does this look right?</Text>

        <View style={styles.card}>
          <Text style={styles.groupName}>{group?.name || 'Ethics 205'}</Text>
          <Text style={styles.groupDescription}>
            {group?.description || 'The study of moral principles'}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
        <TouchableOpacity
            style={styles.noButton}
            onPress={handleReject}
            activeOpacity={0.85}
          >
            <Text style={styles.noButtonText}>No</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.yesButton}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.yesButtonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 64,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 32,
    width: '90%',
    alignItems: 'center',
    marginBottom: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  groupName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  groupDescription: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  yesButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  yesButtonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  noButton: {
    backgroundColor: COLORS.errorLight,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: COLORS.errorLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  noButtonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
