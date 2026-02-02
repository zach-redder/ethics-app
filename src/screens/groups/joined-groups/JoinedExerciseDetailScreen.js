import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { exerciseService, exerciseProgressService, userExerciseCustomizationService } from '../../../services';
import { BottomTabBar } from '../../../components';
import { JoinedExerciseMenuModal } from './JoinedExerciseMenuModal';
import { DayNotesModal } from './DayNotesModal';

/**
 * Joined Exercise Detail Screen
 * Shows days of the exercise with completion status
 */
export const JoinedExerciseDetailScreen = ({ navigation, route }) => {
  const { exerciseId, groupId } = route.params || {};
  const [exercise, setExercise] = useState(null);
  const [customization, setCustomization] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      loadExerciseData();
    }
  }, [exerciseId]);

  const loadExerciseData = async () => {
    try {
      setLoading(true);
      const [exerciseResult, customizationResult, progressResult] = await Promise.all([
        exerciseService.getExerciseById(exerciseId),
        userExerciseCustomizationService.getCustomization(exerciseId),
        exerciseProgressService.getProgressByExercise(exerciseId),
      ]);

      if (exerciseResult.data) setExercise(exerciseResult.data);
      if (customizationResult.data) setCustomization(customizationResult.data);
      if (progressResult.data) setProgress(progressResult.data);
    } catch (error) {
      console.error('Error loading exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse date string to local date (avoiding timezone issues)
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    // Parse YYYY-MM-DD format and create date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDateRange = () => {
    if (customization) {
      return {
        start: parseLocalDate(customization.custom_start_date),
        end: parseLocalDate(customization.custom_end_date),
      };
    }
    if (exercise) {
      return {
        start: parseLocalDate(exercise.start_date),
        end: parseLocalDate(exercise.end_date),
      };
    }
    return null;
  };

  const getDays = () => {
    const range = getDateRange();
    if (!range || !range.start || !range.end) return [];

    const days = [];
    // Use the parsed dates directly (they're already in local timezone)
    const startDate = new Date(range.start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(range.end);
    endDate.setHours(0, 0, 0, 0);
    
    // Start from the start date and include the end date (inclusive)
    let currentDate = new Date(startDate);

    // Include both start and end dates (inclusive)
    // Compare dates by their time value to avoid timezone issues
    const endTime = endDate.getTime();
    
    while (currentDate.getTime() <= endTime) {
      // Format date as YYYY-MM-DD for database comparison
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayProgress = progress.find(p => p.practice_date === dateStr);
      days.push({
        date: new Date(currentDate),
        dateStr,
        dayNumber: days.length + 1,
        isCompleted: dayProgress?.is_completed || false,
        completions: dayProgress?.number_of_completions || 0,
        notes: dayProgress?.notes || null,
      });
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDayPress = (day) => {
    setSelectedDay(day);
    setShowDayModal(true);
  };

  const handleDayUpdated = () => {
    setShowDayModal(false);
    setSelectedDay(null);
    loadExerciseData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (groupId) {
              navigation.navigate('JoinedGroupDetail', { groupId });
            } else if (exercise?.group_id) {
              navigation.navigate('JoinedGroupDetail', { groupId: exercise.group_id });
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      </View>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (groupId) {
              navigation.navigate('JoinedGroupDetail', { groupId });
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Exercise not found</Text>
        </View>
      </View>
    );
  }

  const days = getDays();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (groupId) {
              navigation.navigate('JoinedGroupDetail', { groupId });
            } else if (exercise?.group_id) {
              navigation.navigate('JoinedGroupDetail', { groupId: exercise.group_id });
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{exercise.title}</Text>
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {exercise.description && (
        <Text style={styles.description}>{exercise.description}</Text>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.daysCard}>
          {days.map((day, index) => {
            const isFirst = index === 0;
            const isLast = index === days.length - 1;
            const showCheckmark = day.isCompleted;
            const frequency = exercise.frequency_per_day || 1;
            const progressPercent = frequency > 1 && day.completions > 0 
              ? Math.min((day.completions / frequency) * 100, 100) 
              : (day.isCompleted ? 100 : 0);

            return (
              <TouchableOpacity
                key={day.dateStr}
                style={[
                  styles.dayRow,
                  isFirst && styles.dayRowFirst,
                  isLast && styles.dayRowLast,
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.7}
              >
                {progressPercent > 0 && (
                  <View 
                    style={[
                      styles.progressOverlay,
                      progressPercent === 100 
                        ? styles.progressOverlayFull
                        : { 
                            width: `${progressPercent}%`,
                          }
                    ]} 
                  />
                )}
                <View style={styles.dayContent}>
                  <Text style={styles.dayText}>
                    <Text style={styles.dayNumber}>Day {day.dayNumber}</Text> - {formatDate(day.date)}
                  </Text>
                </View>
                {showCheckmark && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <BottomTabBar navigation={navigation} />

      <JoinedExerciseMenuModal
        visible={showMenu}
        exercise={exercise}
        onClose={() => setShowMenu(false)}
        onTimeframeUpdated={loadExerciseData}
      />

      {selectedDay && (
        <DayNotesModal
          visible={showDayModal}
          exercise={exercise}
          day={selectedDay}
          onClose={() => {
            setShowDayModal(false);
            setSelectedDay(null);
          }}
          onDayUpdated={handleDayUpdated}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    padding: 4,
    alignItems: 'flex-end',
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  daysCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    position: 'relative',
    overflow: 'hidden',
  },
  dayRowFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dayRowLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomWidth: 0,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#A8D5A8',
    zIndex: 0,
  },
  progressOverlayFull: {
    left: 0,
    right: 0,
    width: undefined,
  },
  dayContent: {
    flex: 1,
    zIndex: 1,
  },
  dayText: {
    fontSize: 16,
    color: COLORS.black,
  },
  dayNumber: {
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  loader: {
    flex: 1,
  },
});

