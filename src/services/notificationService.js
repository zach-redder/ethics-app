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

      // Get active exercises
      const { data: exercises, error } = await notificationService.getActiveExercises();
      
      if (error) {
        return { scheduled: false, error };
      }

      if (!exercises || exercises.length === 0) {
        return { scheduled: true, error: null };
      }

      // Schedule notifications for each active exercise
      const scheduledIds = [];
      const now = new Date();

      for (const exercise of exercises) {
        const startDate = new Date(exercise.effectiveStartDate);
        const endDate = new Date(exercise.effectiveEndDate);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        // Only schedule if exercise is active (today is within date range)
        if (todayDate >= startDate && todayDate <= endDate) {
          // Schedule for each day from today (or start date if in future) until end date
          let currentDate = new Date(Math.max(todayDate, startDate));
          const finalEndDate = new Date(endDate);

          while (currentDate <= finalEndDate) {
            // Set time to 1 PM (13:00)
            const notificationDate = new Date(currentDate);
            notificationDate.setHours(13, 0, 0, 0);

            // Only schedule if the notification time hasn't passed
            if (notificationDate >= now) {
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

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
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
