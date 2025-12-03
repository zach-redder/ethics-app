import { supabase } from './supabase';

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
};
