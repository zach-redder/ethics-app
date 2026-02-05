import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { userExerciseCustomizationService } from './userExerciseCustomizationService';

/**
 * Notification Service
 * Handles scheduling and managing exercise reminder notifications
 */

// Pre-built notification messages (20 words or less)
const NOTIFICATION_MESSAGES = [
  "Don't forget your {exerciseName} exercise today. You've got this!",
  "Your {exerciseName} practice awaits. Take a moment for yourself.",
  "Ready for {exerciseName}? Consistency is key to success.",
  "Your {exerciseName} practice is calling. Make today count!",
  "Don't skip your {exerciseName} today. Small steps lead to big changes.",
  "Time to focus on {exerciseName}. You're doing great!",
  "Your {exerciseName} reminder: Stay present and practice mindfulness.",
];

/**
 * Get a random notification message with exercise name
 * @param {string} exerciseName - Name of the exercise
 * @returns {string} Notification message
 */
const getNotificationMessage = (exerciseName) => {
  const randomIndex = Math.floor(Math.random() * NOTIFICATION_MESSAGES.length);
  return NOTIFICATION_MESSAGES[randomIndex].replace('{exerciseName}', exerciseName);
};

/**
 * Configure notification handler
 * This should be called after the app initializes, not at module level
 */
const configureNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Ensure notification object exists
      if (!notification) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      }
      
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
};

export const notificationService = {
  /**
   * Initialize notification service (call this early in app lifecycle)
   */
  initialize: () => {
    configureNotificationHandler();
  },

  /**
   * Request notification permissions
   * @returns {object} { status, error }
   */
  requestPermissions: async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return { status: finalStatus, error: null };
    } catch (error) {
      console.error('Request permissions error:', error.message);
      return { status: null, error };
    }
  },

  /**
   * Get per-user notification settings (frequency & times).
   * Falls back to sensible defaults if none exist.
   * @returns {object} { data, error }
   */
  getUserNotificationSettings: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116: row not found
        throw error;
      }

      if (!data) {
        // Default: 1 reminder at 13:00
        return {
          data: {
            frequency_per_day: 1,
            time_1: '13:00',
            time_2: null,
            time_3: null,
          },
          error: null,
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Get notification settings error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update per-user notification settings.
   * @param {object} settings - { frequency_per_day, time_1, time_2, time_3 }
   * @returns {object} { error }
   */
  updateUserNotificationSettings: async (settings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        frequency_per_day: Math.min(Math.max(settings.frequency_per_day || 1, 1), 3),
        time_1: settings.time_1,
        time_2: settings.frequency_per_day >= 2 ? settings.time_2 : null,
        time_3: settings.frequency_per_day >= 3 ? settings.time_3 : null,
      };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update notification settings error:', error.message);
      return { error };
    }
  },

  /**
   * Get all active exercises for the current user
   * @returns {object} { data, error }
   */
  getActiveExercises: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all groups the user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        return { data: [], error: null };
      }

      const groupIds = memberships.map(m => m.group_id);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get all exercises in user's groups that are active today
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('group_id', groupIds)
        .lte('start_date', today)
        .gte('end_date', today);

      if (exercisesError) throw exercisesError;

      // Check for custom date ranges and filter active exercises
      const activeExercises = [];
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      for (const exercise of exercises || []) {
        // Check if user has custom dates
        const customizationResult = await userExerciseCustomizationService.getCustomization(exercise.id);
        const customization = customizationResult.data;
        
        let effectiveStartDate, effectiveEndDate;
        
        if (customization) {
          // Use custom dates
          effectiveStartDate = customization.custom_start_date;
          effectiveEndDate = customization.custom_end_date;
        } else {
          // Use exercise default dates
          effectiveStartDate = exercise.start_date;
          effectiveEndDate = exercise.end_date;
        }

        // Check if exercise is active today
        const startDate = new Date(effectiveStartDate);
        const endDate = new Date(effectiveEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        if (todayDate >= startDate && todayDate <= endDate) {
          activeExercises.push({
            ...exercise,
            effectiveStartDate,
            effectiveEndDate,
          });
        }
      }

      return { data: activeExercises, error: null };
    } catch (error) {
      console.error('Get active exercises error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Schedule daily notifications for active exercises
   * Uses per-user preferences for frequency (max 3) and times.
   * @returns {object} { scheduled, error }
   */
  scheduleDailyNotifications: async () => {
    try {
      // Request permissions first
      const { status } = await notificationService.requestPermissions();
      if (status !== 'granted') {
        return { scheduled: false, error: new Error('Notification permissions not granted') };
      }

      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Get active exercises (for today, including their effective date ranges)
      const { data: exercises, error } = await notificationService.getActiveExercises();
      
      if (error) {
        return { scheduled: false, error };
      }

      if (!exercises || exercises.length === 0) {
        return { scheduled: true, error: null };
      }

      // Get user notification preferences
      const { data: prefs, error: prefsError } = await notificationService.getUserNotificationSettings();

      if (prefsError) {
        return { scheduled: false, error: prefsError };
      }

      // Build time slots (up to 3 per day)
      const times = [];
      const pushTimeIfValid = (t) => {
        if (!t) return;
        const [h, m] = t.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return;
        times.push({ hour: h, minute: m });
      };

      pushTimeIfValid(prefs.time_1 || '13:00');
      pushTimeIfValid(prefs.time_2);
      pushTimeIfValid(prefs.time_3);

      const frequency = Math.min(Math.max(prefs.frequency_per_day || 1, 1), 3);
      const timeSlots = times.slice(0, frequency > 0 ? frequency : 1);
      if (timeSlots.length === 0) {
        timeSlots.push({ hour: 13, minute: 0 });
      }

      // Schedule notifications per time slot per day (not per exercise),
      // so the user receives at most `frequency` notifications per day total.
      const scheduledIds = [];
      const now = new Date();
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      // Determine the overall date range across all active exercises
      let globalStart = null;
      let globalEnd = null;

      for (const exercise of exercises) {
        const startDate = new Date(exercise.effectiveStartDate);
        const endDate = new Date(exercise.effectiveEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (!globalStart || startDate < globalStart) {
          globalStart = startDate;
        }
        if (!globalEnd || endDate > globalEnd) {
          globalEnd = endDate;
        }
      }

      if (!globalStart || !globalEnd) {
        return { scheduled: true, count: 0, error: null };
      }

      // Start from today or the first active date, whichever is later
      let currentDate = new Date(Math.max(todayDate.getTime(), globalStart.getTime()));

      while (currentDate <= globalEnd) {
        // For each time slot, schedule at most ONE notification,
        // picking a random active exercise for that specific day.
        for (const slot of timeSlots) {
          const notificationDate = new Date(currentDate);
          notificationDate.setHours(slot.hour, slot.minute, 0, 0);

          // Only schedule if the notification time hasn't passed
          if (notificationDate >= now) {
            // Find exercises active on this specific date
            const activeForDay = exercises.filter((exercise) => {
              const startDate = new Date(exercise.effectiveStartDate);
              const endDate = new Date(exercise.effectiveEndDate);
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(0, 0, 0, 0);
              const day = new Date(currentDate);
              day.setHours(0, 0, 0, 0);
              return day >= startDate && day <= endDate;
            });

            if (activeForDay.length === 0) {
              continue;
            }

            // Pick a random exercise for this day/time
            const randomIndex = Math.floor(Math.random() * activeForDay.length);
            const exercise = activeForDay[randomIndex];

            try {
              const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Exercise Reminder',
                  body: getNotificationMessage(exercise.title),
                  sound: true,
                  data: {
                    exerciseId: exercise.id,
                    exerciseName: exercise.title,
                  },
                },
                trigger: {
                  type: 'date',
                  date: notificationDate,
                },
              });

              scheduledIds.push(notificationId);
            } catch (scheduleError) {
              console.error(`Error scheduling notification for ${exercise.title}:`, scheduleError);
            }
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(`✅ Scheduled ${scheduledIds.length} notifications`);
      return { scheduled: true, count: scheduledIds.length, error: null };
    } catch (error) {
      console.error('Schedule notifications error:', error.message);
      return { scheduled: false, error };
    }
  },

  /**
   * Cancel all scheduled notifications
   * @returns {object} { error }
   */
  cancelAllNotifications: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { error: null };
    } catch (error) {
      console.error('Cancel notifications error:', error.message);
      return { error };
    }
  },

  /**
   * Get all scheduled notifications
   * @returns {object} { data, error }
   */
  getScheduledNotifications: async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return { data: notifications, error: null };
    } catch (error) {
      console.error('Get scheduled notifications error:', error.message);
      return { data: null, error };
    }
  },
};
