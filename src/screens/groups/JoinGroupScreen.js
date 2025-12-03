import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants';
import { groupMemberService, groupService } from '../../services';

/**
 * Join Group Screen - Enter 5-digit PIN
 */
export const JoinGroupScreen = ({ navigation }) => {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleCodeChange = (value, index) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 4 && newCode.every(d => d)) {
      handleJoinGroup(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoinGroup = async (groupCode) => {
    const fullCode = groupCode || code.join('');
    if (fullCode.length !== 5) {
      Alert.alert('Error', 'Please enter a 5-digit code');
      return;
    }

    setLoading(true);
    try {
      // Join the group
      const { error, groupId } = await groupMemberService.joinGroup(fullCode);

      if (error) {
        Alert.alert('Error', error.message || 'Invalid group code');
        setLoading(false);
        return;
      }

      // Get group details
      const { data: groupData, error: groupError } = await groupService.getGroupById(groupId);

      if (groupError) {
        Alert.alert('Error', 'Failed to load group details');
        setLoading(false);
        return;
      }

      // Navigate to confirmation
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter Group Code</Text>
        <View style={styles.badge} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Please enter a 5 digit PIN.</Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <View key={index} style={styles.codeInputContainer}>
              <TextInput
                ref={ref => inputRefs.current[index] = ref}
                style={styles.codeInput}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            </View>
          ))}
        </View>

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
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  closeButton: {
    width: 40,
    padding: 4,
  },
  closeIcon: {
    fontSize: 36,
    color: COLORS.black,
    fontWeight: '300',
    lineHeight: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
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
  codeInputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  codeInput: {
    width: 50,
    height: 60,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.black,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray,
  },
  loadingText: {
    marginTop: 32,
    fontSize: 16,
    color: COLORS.gray,
  },
});
