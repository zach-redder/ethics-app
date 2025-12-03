import { auth } from './supabase';

/**
 * Authentication Service
 * Handles all authentication-related operations
 */

export const authService = {
  /**
   * Sign up a new user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {object} metadata - Additional user metadata
   */
  signUp: async (email, password, metadata = {}) => {
    try {
      const { data, error } = await auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  signIn: async (email, password) => {
    try {
      const { data, error } = await auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error.message);
      return { error };
    }
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    try {
      const { data, error } = await auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get session error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get the current user
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error.message);
      return { user: null, error };
    }
  },

  /**
   * Reset password for user email
   * @param {string} email - User's email
   */
  resetPassword: async (email) => {
    try {
      const { data, error } = await auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update user password
   * @param {string} newPassword - New password
   */
  updatePassword: async (newPassword) => {
    try {
      const { data, error } = await auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update password error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Listen to auth state changes
   * @param {function} callback - Callback function to handle auth state changes
   */
  onAuthStateChange: (callback) => {
    return auth.onAuthStateChange(callback);
  },
};
