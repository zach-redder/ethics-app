import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, Input } from '../../components/index';
import { COLORS, SIZES } from '../../constants/index';
import { authService, userService } from '../../services/index';

/**
 * Profile Screen
 * Demonstrates user profile management with Supabase
 */
export const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Get current user
      const { user: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Load user profile
        const { data, error } = await userService.getProfile(currentUser.id);

        if (!error && data) {
          setProfile(data);
          setUsername(data.username || '');
          setFullName(data.full_name || '');
          setBio(data.bio || '');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await userService.upsertProfile(user.id, {
        username,
        full_name: fullName,
        bio,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
        setProfile(data);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {user && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>

        <View style={styles.form}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
          />

          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />

          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />

          <Button
            title="Save Profile"
            onPress={handleSaveProfile}
            loading={saving}
            style={styles.button}
          />

          <Button
            title="Back to Home"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.button}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Profile Information</Text>
          <Text style={styles.infoText}>
            This screen demonstrates how to:
          </Text>
          <Text style={styles.infoItem}>• Load user data from Supabase</Text>
          <Text style={styles.infoItem}>• Update user profiles</Text>
          <Text style={styles.infoItem}>• Handle form inputs</Text>
          <Text style={styles.infoItem}>• Manage loading states</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  email: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: SIZES.base,
  },
  form: {
    padding: SIZES.padding * 2,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: SIZES.padding,
  },
  infoSection: {
    margin: SIZES.padding * 2,
    marginTop: 0,
    padding: SIZES.padding * 1.5,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
  },
  infoTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SIZES.padding,
  },
  infoText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  infoItem: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginLeft: SIZES.padding,
    marginBottom: SIZES.base / 2,
  },
});
