import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { userService, authService } from '../../services';
import { EditProfileModal } from './EditProfileModal';
import { BottomTabBar } from '../../components';

/**
 * Profile Screen
 * Main profile screen with settings options
 */
export const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const { data, error } = await userService.getCurrentUser();
      if (error) {
        console.error('Error loading user:', error);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleNotifications = () => {
    navigation.navigate('NotificationSettings');
  };

  const handleReportIssue = () => {
    navigation.navigate('ReportIssue');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } = await authService.signOut();
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              // Navigation will be handled by auth state change listener in App.js
            }
          },
        },
      ]
    );
  };

  const handleProfileUpdated = () => {
    setShowEditModal(false);
    loadUser();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileSection}>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={20} color={COLORS.black} />
          <Text style={styles.menuItemText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleNotifications}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.black} />
          <Text style={styles.menuItemText}>Notifications</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleReportIssue}
          activeOpacity={0.7}
        >
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.secondary} />
          <Text style={[styles.menuItemText, styles.reportIssueText]}>Report Issue</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <BottomTabBar navigation={navigation} activeScreen="Profile" />

      <EditProfileModal
        visible={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 70,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  logoutText: {
    color: COLORS.error,
  },
  reportIssueText: {
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
});

