import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants';
import { groupService } from '../../services';
import { BottomTabBar } from '../../components';

/**
 * Dashboard Screen - Main app screen showing user's groups
 */
export const DashboardScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'joined');
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
    checkAndRequestNotifications();
  }, []);

  const checkAndRequestNotifications = async () => {
    try {
      // Check if we've already requested notifications
      const hasRequestedNotifications = await AsyncStorage.getItem('hasRequestedNotifications');
      
      // Only request if:
      // 1. We haven't requested before
      // 2. User is coming from onboarding (GroupConfirmation) - check route params
      const isFromOnboarding = route.params?.fromOnboarding;
      
      if (!hasRequestedNotifications && isFromOnboarding) {
        // Configure notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
        
        // Request notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        // Mark that we've requested permissions (regardless of whether they granted it)
        await AsyncStorage.setItem('hasRequestedNotifications', 'true');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const [created, joined] = await Promise.all([
        groupService.getCreatedGroups(),
        groupService.getJoinedGroups(),
      ]);

      if (created.data) setCreatedGroups(created.data);
      if (joined.data) setJoinedGroups(joined.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const renderGroupCard = (group, role, isLast) => (
    <View key={group.id}>
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => {
          if (role === 'Owner') {
            navigation.navigate('CreatedGroupDetail', { groupId: group.id });
          } else {
            navigation.navigate('JoinedGroupDetail', { groupId: group.id });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.roleText}>{role}</Text>
        </View>
        <Text style={styles.groupDescription} numberOfLines={2}>
          {group.description || 'No description'}
        </Text>
      </TouchableOpacity>
      {!isLast && <View style={styles.groupSeparator} />}
    </View>
  );

  const currentGroups = activeTab === 'created' ? createdGroups : joinedGroups;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <View style={styles.tabsHeader}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'created' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('created')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'created' && styles.tabTextActive,
              ]}
            >
              Created
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'joined' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('joined')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'joined' && styles.tabTextActive,
              ]}
            >
              Joined
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.groupsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : currentGroups.length > 0 ? (
            currentGroups.map((group, index) =>
              renderGroupCard(
                group,
                activeTab === 'created' ? 'Owner' : 'Member',
                index === currentGroups.length - 1
              )
            )
          ) : (
            <Text style={styles.emptyText}>No groups yet</Text>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate(
              activeTab === 'created' ? 'CreateGroup' : 'JoinGroup',
              { fromDashboard: true }
            )
          }
          activeOpacity={0.85}
        >
          {activeTab === 'created' ? (
            <Ionicons name="add" size={24} color={COLORS.white} style={styles.actionIcon} />
          ) : (
            <MaterialCommunityIcons name="login" size={22} color={COLORS.white} style={styles.actionIcon} />
          )}
          <Text style={styles.actionButtonText}>
            {activeTab === 'created' ? 'Create Group' : 'Join Group'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityCard}>
        <Text style={styles.activityTitle}>Recent Activity</Text>
        <Text style={styles.activityText}>
          Nothing here, check back later!
        </Text>
      </View>

      <BottomTabBar navigation={navigation} activeScreen="Dashboard" />
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabsHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 16,
  },

  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 14,
    paddingVertical: 20,
  },
  groupCard: {
    marginBottom: 16,
  },
  groupSeparator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  roleText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.gray,
  },
  groupDescription: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});
