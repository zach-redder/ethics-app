import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { groupService } from '../../services';

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
  }, []);

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

  const renderGroupCard = (group, role) => (
    <View key={group.id} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.roleText}>{role}</Text>
      </View>
      <Text style={styles.groupDescription} numberOfLines={2}>
        {group.description || 'No description'}
      </Text>
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
            currentGroups.map((group) =>
              renderGroupCard(
                group,
                activeTab === 'created' ? 'Owner' : 'Member'
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
              activeTab === 'created' ? 'CreateGroup' : 'JoinGroup'
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

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
          <Ionicons name="home" size={24} color={COLORS.black} />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
        >
          <Ionicons name="person" size={24} color={COLORS.gray} />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    maxHeight: 400,
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
  groupsList: {
    maxHeight: 150,
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
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: COLORS.secondary,
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '500',
    marginTop: 4,
  },
  navLabelInactive: {
    color: COLORS.gray,
  },
});
