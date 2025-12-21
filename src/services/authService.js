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
    console.log('📝 [signUp] Starting sign up for:', email);
    try {
      const { data, error } = await auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('❌ [signUp] Error:', {
          message: error.message,
          name: error.name,
          status: error.status,
        });
        throw error;
      }
      
      console.log('✅ [signUp] Success:', {
        userId: data.user?.id,
        email: data.user?.email,
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ [signUp] Exception:', {
        message: error.message,
        name: error.name,
        type: error.constructor.name,
      });
      
      // Provide helpful error messages
      if (error.message?.includes('Network request failed')) {
        console.error('🌐 [signUp] Network error - check your internet connection and Supabase configuration');
      }
      
      return { data: null, error };
    }
  },

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  signIn: async (email, password) => {
    console.log('🔑 [signIn] Starting sign in for:', email);
    try {
      const { data, error } = await auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ [signIn] Error:', {
          message: error.message,
          name: error.name,
          status: error.status,
        });
        throw error;
      }
      
      console.log('✅ [signIn] Success:', {
        userId: data.user?.id,
        email: data.user?.email,
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ [signIn] Exception:', {
        message: error.message,
        name: error.name,
        type: error.constructor.name,
      });
      
      // Provide helpful error messages
      if (error.message?.includes('Network request failed')) {
        console.error('🌐 [signIn] Network error - check your internet connection and Supabase configuration');
      }
      
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
    const timestamp = new Date().toISOString();
    console.log('🔐 [getSession] Starting session check at', timestamp);
    
    try {
      const { data, error } = await auth.getSession();
      
      if (error) {
        console.error('❌ [getSession] Error occurred:', {
          message: error.message,
          name: error.name,
          status: error.status,
          timestamp,
        });
        
        // If it's a network error with refresh token, clear the session
        if ((error.message?.includes('Network request failed') || 
             error.name === 'AuthRetryableFetchError') && 
            error.message?.includes('refresh_token')) {
          console.warn('⚠️ [getSession] Refresh token network error - clearing session');
          try {
            await auth.signOut();
          } catch (signOutError) {
            console.error('Error signing out:', signOutError);
          }
          return { data: { session: null }, error: null }; // Return empty session instead of error
        }
        
        throw error;
      }
      
      console.log('✅ [getSession] Success:', {
        hasSession: !!data?.session,
        hasUser: !!data?.session?.user,
        userId: data?.session?.user?.id,
        timestamp,
      });
      
      return { data, error: null };
    } catch (error) {
      // Suppress stack trace logging for network errors to reduce noise
      const isNetworkError = error.message?.includes('Network request failed') || 
                            error.name === 'AuthRetryableFetchError';
      
      if (!isNetworkError) {
        console.error('❌ [getSession] Exception caught:', {
          message: error.message,
          name: error.name,
          type: error.constructor.name,
          stack: error.stack?.split('\n').slice(0, 5).join('\n'),
          timestamp,
        });
      } else {
        console.warn('⚠️ [getSession] Network error (suppressing details):', error.message);
      }
      
      // Check for specific error types
      if (isNetworkError) {
        // If it's a refresh token error, return empty session instead of propagating error
        if (error.message?.includes('refresh_token') || error.name === 'AuthRetryableFetchError') {
          console.warn('⚠️ [getSession] Treating refresh error as no session');
          try {
            await auth.signOut(); // Clear the bad session
          } catch (signOutError) {
            // Ignore sign out errors
          }
          return { data: { session: null }, error: null };
        }
      }
      
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
    console.log('👂 [onAuthStateChange] Setting up auth state listener');
    
    const wrappedCallback = (event, session) => {
      console.log('🔄 [onAuthStateChange] Event received:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
      });
      
      try {
        callback(event, session);
      } catch (error) {
        console.error('❌ [onAuthStateChange] Callback error:', {
          error: error.message,
          event,
          timestamp: new Date().toISOString(),
        });
      }
    };
    
    const listener = auth.onAuthStateChange(wrappedCallback);
    console.log('✅ [onAuthStateChange] Listener set up successfully');
    
    return listener;
  },
};
