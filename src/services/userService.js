import { supabase } from './supabase';
import { notificationService } from './notificationService';

/**
 * User Service
 * Handles user profile and related database operations
 *
 * Table: users
 * See docs/supabase-schema.md for table structure
 */

export const userService = {
  /**
   * Create user profile (called after signup)
   * @param {string} userId - User's ID
   * @param {string} name - User's name
   */
  createUser: async (userId, name) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: name,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create user error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get user by user ID
   * @param {string} userId - User's ID
   */
  getUser: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get current user's profile
   */
  getCurrentUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get current user error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User's ID
   * @param {object} updates - Fields to update
   */
  updateUser: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update user error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Delete user profile
   * @param {string} userId - User's ID
   */
  deleteUser: async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete user error:', error.message);
      return { error };
    }
  },

  /**
   * Delete user account and all associated data
   * This will:
   * 1. Cancel all scheduled notifications
   * 2. Delete notification preferences
   * 3. Delete the user from auth.users (which cascades to all related tables)
   * @returns {object} { error }
   */
  deleteAccount: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const userId = user.id;

      // 1. Cancel all scheduled notifications
      await notificationService.cancelAllNotifications();

      // 2. Delete notification preferences (if table exists)
      try {
        await supabase
          .from('notification_preferences')
          .delete()
          .eq('user_id', userId);
      } catch (prefsError) {
        // Table might not exist, ignore error
        console.warn('Could not delete notification preferences:', prefsError.message);
      }

      // 3. Delete the user account via database function
      // This will delete from auth.users (which cascades to users table and all related tables)
      const { error: deleteError } = await supabase.rpc('delete_user_account');

      if (deleteError) {
        // Fallback: if RPC function doesn't exist, try direct deletion from users table
        // This will delete user data but leave auth.users record
        const { error: fallbackError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        
        if (fallbackError) throw fallbackError;
      }
      
      // Always sign out after deletion to clear local session and trigger auth state change
      // This ensures the user is properly logged out and redirected to Welcome screen
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        // Even if sign out fails, the user is deleted so session will be invalid
        // Log but don't throw - deletion was successful
        console.warn('Sign out after account deletion:', signOutError.message);
      }

      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error.message);
      return { error };
    }
  },
};
