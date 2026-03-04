import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants';
import { groupMemberService, groupService } from '../../services';

/**
 * Join Group Screen - Enter 5-digit PIN
 */
export const JoinGroupScreen = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 5);
    setCode(digits);
    if (digits.length === 5) {
      handleJoinGroup(digits);
    }
  };

  const handleJoinGroup = async (groupCode) => {
    const fullCode = groupCode || code;
    if (fullCode.length !== 5) {
      Alert.alert('Error', 'Please enter a 5-digit code');
      return;
    }

    setLoading(true);
    try {
      const { error, groupId } = await groupMemberService.joinGroup(fullCode);

      if (error) {
        Alert.alert('Error', error.message || 'Invalid group code');
        setLoading(false);
        return;
      }

      const { data: groupData, error: groupError } = await groupService.getGroupById(groupId);

      if (groupError) {
        Alert.alert('Error', 'Failed to load group details');
        setLoading(false);
        return;
      }

      navigation.navigate('GroupConfirmation', {
        group: groupData,
        isCreator: false,
      });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // The "cursor" position: the next empty box, capped at the last box
  const activeIndex = Math.min(code.length, 4);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (route?.params?.fromDashboard) {
              navigation.navigate('Dashboard');
            } else {
              navigation.goBack();
            }
          }}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Enter Group Code</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Please enter a 5 digit PIN.</Text>

        {/* Tapping anywhere on the row focuses the hidden input */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.codeContainer}
        >
          {[0, 1, 2, 3, 4].map((index) => {
            const isActive = focused && index === activeIndex;
            return (
              <View
                key={index}
                style={[styles.codeBox, isActive && styles.codeBoxActive]}
              >
                <Text style={styles.digitText}>{code[index] ?? ''}</Text>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Single hidden input — captures all keystrokes, never shown */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={5}
          caretHidden
          style={styles.hiddenInput}
        />

        {loading && (
          <Text style={styles.loadingText}>Joining group...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  closeButton: {
    width: 40,
    padding: 4,
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 36,
    color: COLORS.secondary,
    fontWeight: '300',
    lineHeight: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 48,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  codeBox: {
    width: 50,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray,
    ...SHADOWS.light,
  },
  codeBoxActive: {
    backgroundColor: COLORS.background,
    borderBottomColor: COLORS.primary,
  },
  digitText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.black,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  loadingText: {
    marginTop: 32,
    fontSize: 16,
    color: COLORS.gray,
  },
});
