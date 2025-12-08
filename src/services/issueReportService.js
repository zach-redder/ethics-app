import { supabase } from './supabase';

/**
 * Issue Report Service
 * Handles issue/bug report submissions
 *
 * Table: issue_reports
 */

export const issueReportService = {
  /**
   * Submit an issue report
   * @param {string} title - Issue title
   * @param {string} description - Issue description
   */
  submitReport: async (title, description) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('issue_reports')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Submit issue report error:', error.message);
      return { data: null, error };
    }
  },
};

