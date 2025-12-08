import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { groupMemberService } from '../../../services';
import { BottomTabBar } from '../../../components';
import { DeleteMemberModal } from './DeleteMemberModal';

/**
 * Manage Members Screen
 * Screen for managing group members (search and delete)
 */
export const ManageMembersScreen = ({ navigation, route }) => {
  const { groupId } = route.params || {};
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadMembers();
    }
  }, [groupId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = members.filter((member) =>
        member.users?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchQuery, members]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await groupMemberService.getGroupMembers(groupId);

      if (error) {
        console.error('Error loading members:', error);
        return;
      }

      if (data) {
        setMembers(data);
        setFilteredMembers(data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleMemberDeleted = () => {
    setShowDeleteModal(false);
    setSelectedMember(null);
    loadMembers();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Members</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.inputPlaceholder}
        />
        <Ionicons
          name="search"
          size={20}
          color={COLORS.gray}
          style={styles.searchIcon}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Name</Text>
        <Text style={[styles.headerText, styles.roleHeader]}>Role</Text>
        <View style={styles.deleteHeaderPlaceholder} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.membersList}>
          {filteredMembers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          ) : (
            filteredMembers.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <Text style={styles.memberName}>
                {member.users?.name || 'Unknown'}
              </Text>
              <Text style={styles.memberRole}>
                {member.role === 'owner' ? 'Owner' : 'Member'}
              </Text>
              {member.role !== 'owner' ? (
                <TouchableOpacity
                  onPress={() => handleDeleteClick(member)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash"
                    size={18}
                    color={COLORS.error}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.deleteButtonPlaceholder} />
              )}
            </View>
          )))}
        </ScrollView>
      )}

      <BottomTabBar navigation={navigation} />

      <DeleteMemberModal
        visible={showDeleteModal}
        member={selectedMember}
        groupId={groupId}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMember(null);
        }}
        onMemberDeleted={handleMemberDeleted}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    position: 'relative',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  roleHeader: {
    marginLeft: 160,
  },
  deleteHeaderPlaceholder: {
    width: 40,
    marginLeft: 'auto',
  },
  membersList: {
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  memberName: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  memberRole: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 40,
    minWidth: 60,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 50,
  },
  deleteButtonPlaceholder: {
    width: 26,
    marginLeft: 50,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});

