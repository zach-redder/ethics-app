import { supabase } from './supabase';

/**
 * User Exercise Customization Service
 * Handles user-specific exercise date customization
 *
 * Table: user_exercise_customization
 */

export const userExerciseCustomizationService = {
  /**
   * Get customization for an exercise
   * @param {string} exerciseId - Exercise ID
   * @returns {object} { data, error }
   */
  getCustomization: async (exerciseId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_exercise_customization')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get customization error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Create or update customization
   * @param {string} exerciseId - Exercise ID
   * @param {string} customStartDate - Start date in YYYY-MM-DD format
   * @param {string} customEndDate - End date in YYYY-MM-DD format
   * @returns {object} { data, error }
   */
  upsertCustomization: async (exerciseId, customStartDate, customEndDate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_exercise_customization')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          custom_start_date: customStartDate,
          custom_end_date: customEndDate,
        }, {
          onConflict: 'user_id,exercise_id',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Upsert customization error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Delete customization
   * @param {string} exerciseId - Exercise ID
   * @returns {object} { error }
   */
  deleteCustomization: async (exerciseId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_exercise_customization')
        .delete()
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete customization error:', error.message);
      return { error };
    }
  },
};

