import { supabase } from './supabase';

/**
 * Exercise Progress Service
 * Handles exercise progress tracking
 *
 * Table: exercise_progress
 */

export const exerciseProgressService = {
  /**
   * Get progress for an exercise
   * @param {string} exerciseId - Exercise ID
   * @returns {object} { data, error }
   */
  getProgressByExercise: async (exerciseId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id)
        .order('practice_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get progress error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get progress for a specific date
   * @param {string} exerciseId - Exercise ID
   * @param {string} practiceDate - Date in YYYY-MM-DD format
   * @returns {object} { data, error }
   */
  getProgressByDate: async (exerciseId, practiceDate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id)
        .eq('practice_date', practiceDate)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get progress by date error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Create or update progress for a date
   * @param {string} exerciseId - Exercise ID
   * @param {string} practiceDate - Date in YYYY-MM-DD format
   * @param {object} progressData - Progress data (number_of_completions, is_completed, notes)
   * @returns {object} { data, error }
   */
  upsertProgress: async (exerciseId, practiceDate, progressData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData = {
        number_of_completions: progressData.number_of_completions || 0,
        is_completed: progressData.is_completed || false,
        notes: progressData.notes || null,
      };

      if (updateData.is_completed) {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('exercise_progress')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          practice_date: practiceDate,
          ...updateData,
        }, {
          onConflict: 'user_id,exercise_id,practice_date',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Upsert progress error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Complete a day
   * @param {string} exerciseId - Exercise ID
   * @param {string} practiceDate - Date in YYYY-MM-DD format
   * @returns {object} { data, error }
   */
  completeDay: async (exerciseId, practiceDate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercise_progress')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          practice_date: practiceDate,
          is_completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,exercise_id,practice_date',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Complete day error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Add one completion to a day
   * @param {string} exerciseId - Exercise ID
   * @param {string} practiceDate - Date in YYYY-MM-DD format
   * @returns {object} { data, error }
   */
  addCompletion: async (exerciseId, practiceDate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current progress
      const { data: current } = await exerciseProgressService.getProgressByDate(exerciseId, practiceDate);
      const currentCompletions = current?.number_of_completions || 0;

      const updateData = {
        user_id: user.id,
        exercise_id: exerciseId,
        practice_date: practiceDate,
        number_of_completions: currentCompletions + 1,
        is_completed: current?.is_completed || false,
        notes: current?.notes || null,
      };

      const { data, error } = await supabase
        .from('exercise_progress')
        .upsert(updateData, {
          onConflict: 'user_id,exercise_id,practice_date',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add completion error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Clear/undo a day
   * @param {string} exerciseId - Exercise ID
   * @param {string} practiceDate - Date in YYYY-MM-DD format
   * @returns {object} { error }
   */
  clearDay: async (exerciseId, practiceDate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('exercise_progress')
        .delete()
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id)
        .eq('practice_date', practiceDate);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Clear day error:', error.message);
      return { error };
    }
  },
};

