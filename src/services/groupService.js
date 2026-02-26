import { supabase } from './supabase';

/**
 * Group Service
 * Handles group-related database operations
 */

export const groupService = {
  /**
   * Create a new group
   * @param {object} groupData - Group data (name, description, start_date, end_date)
   * @returns {object} { data, error }
   */
  createGroup: async (groupData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate a unique group code
      const { data: generatedCode, error: codeError } = await supabase
        .rpc('generate_group_code');

      if (codeError) throw codeError;

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name: groupData.name,
          description: groupData.description,
          start_date: groupData.start_date,
          end_date: groupData.end_date,
          owner_id: user.id,
          group_code: generatedCode,
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Manually add the owner as a member (since we removed the trigger)
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: 'owner',
        }]);

      if (memberError) {
        // If adding member fails, delete the group to maintain consistency
        await supabase.from('groups').delete().eq('id', group.id);
        throw memberError;
      }

      return { data: group, error: null };
    } catch (error) {
      console.error('Create group error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get group by ID
   * @param {string} groupId - Group ID
   * @returns {object} { data, error }
   */
  getGroupById: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get group error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get group by group code
   * @param {string} groupCode - 5-digit group code
   * @returns {object} { data, error }
   */
  getGroupByCode: async (groupCode) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('group_code', groupCode)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get group by code error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get all groups for current user
   * @returns {object} { data, error }
   */
  getUserGroups: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, get the group IDs the user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        return { data: [], error: null };
      }

      const groupIds = memberships.map(m => m.group_id);

      // Then get the groups
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user groups error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get groups created by current user
   * @returns {object} { data, error }
   */
  getCreatedGroups: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get created groups error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get groups joined by current user (not owned)
   * @returns {object} { data, error }
   */
  getJoinedGroups: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, get the group IDs the user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        return { data: [], error: null };
      }

      const groupIds = memberships.map(m => m.group_id);

      // Then get the groups (excluding ones user owns)
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .neq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get joined groups error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update group
   * @param {string} groupId - Group ID
   * @param {object} updates - Fields to update
   * @returns {object} { data, error }
   */
  updateGroup: async (groupId, updates) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update group error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Delete group
   * @param {string} groupId - Group ID
   * @returns {object} { error }
   */
  deleteGroup: async (groupId) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete group error:', error.message);
      return { error };
    }
  },
};
