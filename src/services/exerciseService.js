import { supabase } from './supabase';

/**
 * Exercise Service
 * Handles exercise-related database operations
 */

export const exerciseService = {
  /**
   * Create a new exercise
   * @param {object} exerciseData - Exercise data (group_id, title, description, instructions, start_date, end_date, frequency_per_day)
   * @returns {object} { data, error }
   */
  createExercise: async (exerciseData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          group_id: exerciseData.group_id,
          title: exerciseData.title,
          description: exerciseData.description,
          instructions: exerciseData.instructions,
          start_date: exerciseData.start_date,
          end_date: exerciseData.end_date,
          frequency_per_day: exerciseData.frequency_per_day,
          number_of_days: exerciseData.number_of_days,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create exercise error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get exercises for a group
   * @param {string} groupId - Group ID
   * @returns {object} { data, error }
   */
  getExercisesByGroup: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get exercises error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get exercise by ID
   * @param {string} exerciseId - Exercise ID
   * @returns {object} { data, error }
   */
  getExerciseById: async (exerciseId) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get exercise error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update exercise
   * @param {string} exerciseId - Exercise ID
   * @param {object} updates - Fields to update
   * @returns {object} { data, error }
   */
  updateExercise: async (exerciseId, updates) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', exerciseId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update exercise error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Delete exercise
   * @param {string} exerciseId - Exercise ID
   * @returns {object} { error }
   */
  deleteExercise: async (exerciseId) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete exercise error:', error.message);
      return { error };
    }
  },

  /**
   * Check if exercise is currently active (within date range)
   * @param {object} exercise - Exercise object with start_date and end_date
   * @returns {boolean}
   */
  isExerciseActive: (exercise) => {
    if (!exercise.start_date || !exercise.end_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(exercise.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(exercise.end_date);
    endDate.setHours(0, 0, 0, 0);
    return today >= startDate && today <= endDate;
  },
};

