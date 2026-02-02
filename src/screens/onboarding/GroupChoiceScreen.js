import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

/**
 * Group Choice Screen - Create or Join Group
 */
export const GroupChoiceScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Let's get started!</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateGroup')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={28} color={COLORS.white} style={styles.icon} />
            <Text style={styles.buttonText}>Create Group</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => navigation.navigate('JoinGroup')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="login" size={24} color={COLORS.white} style={styles.icon} />
            <Text style={styles.buttonText}>Join Group</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 80,
  },
  buttonsContainer: {
    width: '100%',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  joinButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray,
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 14,
  },
});
