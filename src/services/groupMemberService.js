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

      // First, find the group by code using security definer function
      // This bypasses RLS to allow looking up groups by code without being a member
      const { data: groupId, error: functionError } = await supabase
        .rpc('get_group_id_by_code', { group_code_param: groupCode });

      if (functionError || !groupId) {
        console.error('Group lookup error:', functionError);
        throw new Error('Invalid group code');
      }

      const group = { id: groupId };

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
      console.log('[groupMemberService] getGroupMembers called with groupId:', groupId);
      
      // Get current user for logging
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[groupMemberService] Current user:', user?.id);
      
      // First, try to get raw count without RLS to see actual member count
      // This will help us understand if RLS is filtering
      try {
        const { count, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId);
        console.log('[groupMemberService] Total members in DB (with RLS):', count);
        if (countError) {
          console.log('[groupMemberService] Count error:', countError);
        }
      } catch (countErr) {
        console.log('[groupMemberService] Could not get count:', countErr);
      }
      
      // Try query without users join first to see if that's the issue
      const { data: membersOnly, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });
      
      console.log('[groupMemberService] Members without users join:', {
        count: membersOnly?.length,
        members: membersOnly?.map(m => ({ id: m.id, user_id: m.user_id, role: m.role })),
        error: membersError,
      });
      
      // Now try with users join
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          users(id, name)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      console.log('[groupMemberService] Supabase query result:', {
        hasData: !!data,
        dataLength: data?.length,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details,
        errorHint: error?.hint,
      });

      if (error) {
        console.error('[groupMemberService] Full error object:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (data) {
        console.log('[groupMemberService] Raw data from Supabase:', JSON.stringify(data, null, 2));
        console.log('[groupMemberService] Number of members returned:', data.length);
        console.log('[groupMemberService] Comparison - membersOnly count:', membersOnly?.length, 'vs with users join:', data.length);
        
        // Check if any members have null users object
        const membersWithNullUsers = data.filter(m => !m.users);
        if (membersWithNullUsers.length > 0) {
          console.warn('[groupMemberService] Members with null users object:', membersWithNullUsers.length);
          console.warn('[groupMemberService] These members:', membersWithNullUsers.map(m => ({ id: m.id, user_id: m.user_id, role: m.role })));
        }
        
        // Log each member's structure
        data.forEach((member, index) => {
          console.log(`[groupMemberService] Member ${index + 1} structure:`, {
            id: member.id,
            group_id: member.group_id,
            user_id: member.user_id,
            role: member.role,
            joined_at: member.joined_at,
            usersObject: member.users,
            usersId: member.users?.id,
            usersName: member.users?.name,
          });
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('[groupMemberService] Exception in getGroupMembers:', error);
      console.error('[groupMemberService] Error stack:', error.stack);
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
