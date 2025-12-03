import { supabase } from './supabase';

/**
 * Group Member Service
 * Handles group membership operations
 */

export const groupMemberService = {
  /**
   * Join a group using group code
   * @param {string} groupCode - 5-digit group code
   * @returns {object} { data, error }
   */
  joinGroup: async (groupCode) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, find the group by code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('group_code', groupCode)
        .single();

      if (groupError) throw new Error('Invalid group code');
      if (!group) throw new Error('Group not found');

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('You are already a member of this group');
      }

      // Join the group
      const { data, error } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: 'member',
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null, groupId: group.id };
    } catch (error) {
      console.error('Join group error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Leave a group
   * @param {string} groupId - Group ID
   * @returns {object} { error }
   */
  leaveGroup: async (groupId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Leave group error:', error.message);
      return { error };
    }
  },

  /**
   * Get all members of a group
   * @param {string} groupId - Group ID
   * @returns {object} { data, error }
   */
  getGroupMembers: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          users(id, name)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get group members error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Remove a member from a group (owner only)
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to remove
   * @returns {object} { error }
   */
  removeMember: async (groupId, userId) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Remove member error:', error.message);
      return { error };
    }
  },

  /**
   * Get user's role in a group
   * @param {string} groupId - Group ID
   * @returns {object} { data, error }
   */
  getUserRole: async (groupId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user role error:', error.message);
      return { data: null, error };
    }
  },
};
