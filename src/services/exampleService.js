import { supabase } from './supabase';

/**
 * Example Service
 * Template for creating services for other Supabase tables
 *
 * This example uses a hypothetical 'items' table
 * See docs/supabase-schema.md for table structure
 *
 * Copy this file and modify for your specific table needs
 */

const TABLE_NAME = 'items'; // Change to your table name

export const exampleService = {
  /**
   * Create a new item
   * @param {object} itemData - Item data
   */
  create: async (itemData) => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([{
          ...itemData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Create ${TABLE_NAME} error:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Get a single item by ID
   * @param {string} id - Item ID
   */
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Get ${TABLE_NAME} error:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Get all items with optional filters
   * @param {object} filters - Query filters
   * @param {number} limit - Number of results
   * @param {number} offset - Pagination offset
   */
  getAll: async (filters = {}, limit = 10, offset = 0) => {
    try {
      let query = supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error(`Get all ${TABLE_NAME} error:`, error.message);
      return { data: null, count: 0, error };
    }
  },

  /**
   * Update an item
   * @param {string} id - Item ID
   * @param {object} updates - Fields to update
   */
  update: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Update ${TABLE_NAME} error:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Delete an item
   * @param {string} id - Item ID
   */
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error(`Delete ${TABLE_NAME} error:`, error.message);
      return { error };
    }
  },

  /**
   * Get items by user ID (assuming user_id column exists)
   * @param {string} userId - User ID
   */
  getByUserId: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Get ${TABLE_NAME} by user error:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Subscribe to real-time changes
   * @param {function} callback - Callback for changes
   * @param {string} filter - Optional filter
   */
  subscribe: (callback, filter = null) => {
    const channel = supabase.channel(`${TABLE_NAME}-changes`);

    const config = {
      event: '*',
      schema: 'public',
      table: TABLE_NAME,
    };

    if (filter) {
      config.filter = filter;
    }

    const subscription = channel
      .on('postgres_changes', config, callback)
      .subscribe();

    return subscription;
  },

  /**
   * Unsubscribe from real-time changes
   * @param {object} subscription - Subscription object
   */
  unsubscribe: async (subscription) => {
    if (subscription) {
      await supabase.removeChannel(subscription);
    }
  },
};
