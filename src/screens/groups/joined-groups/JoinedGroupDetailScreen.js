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
import { COLORS, SHADOWS } from '../../../constants';
import { groupService, exerciseService } from '../../../services';
import { formatters } from '../../../utils';
import { BottomTabBar } from '../../../components';

/**
 * Joined Group Detail Screen
 * Main screen for viewing a joined group with exercises
 */
export const JoinedGroupDetailScreen = ({ navigation, route }) => {
  const { groupId } = route.params || {};
  const [group, setGroup] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const [groupResult, exercisesResult] = await Promise.all([
        groupService.getGroupById(groupId),
        exerciseService.getExercisesByGroup(groupId),
      ]);

      if (groupResult.data) setGroup(groupResult.data);
      if (exercisesResult.data) setExercises(exercisesResult.data);
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExerciseUnlocked = (exercise) => {
    if (!exercise.start_date || !exercise.end_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(exercise.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(exercise.end_date);
    endDate.setHours(0, 0, 0, 0);
    return today >= startDate && today <= endDate;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        </View>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Group not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.groupCodeContainer}>
        <Text style={styles.groupCodeLabel}>Group Code: </Text>
        <Text style={styles.groupCodeValue}>{group.group_code}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises yet!</Text>
          </View>
        ) : (
          exercises.map((exercise) => {
            const isCurrentTimeframe = isExerciseUnlocked(exercise);
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  isCurrentTimeframe
                    ? styles.exerciseCardUnlocked
                    : styles.exerciseCardLocked,
                ]}
                onPress={() => {
                  navigation.navigate('JoinedExerciseDetail', { 
                    exerciseId: exercise.id,
                    groupId: groupId 
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseContent}>
                  <Text
                    style={styles.exerciseTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {exercise.title}
                  </Text>
                  <Text style={styles.exerciseDescription} numberOfLines={2}>
                    {exercise.description || 'No description'}
                  </Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.dateText}>
                    Starts: {formatters.formatDateShort(exercise.start_date)}
                  </Text>
                  <Text style={styles.dateText}>
                    Ends: {formatters.formatDateShort(exercise.end_date)}
                  </Text>
                  <View style={styles.iconContainer}>
                    {isCurrentTimeframe ? (
                      <Ionicons name="lock-open" size={20} color={COLORS.black} />
                    ) : (
                      <Ionicons name="lock-closed" size={20} color={COLORS.black} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomTabBar navigation={navigation} />
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
  placeholder: {
    width: 40,
  },
  groupCodeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  groupCodeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  groupCodeValue: {
    fontSize: 16,
    fontWeight: 'normal',
    color: COLORS.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
    ...SHADOWS.light,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    ...SHADOWS.light,
  },
  exerciseCardUnlocked: {
    backgroundColor: COLORS.success,
  },
  exerciseCardInactive: {
    backgroundColor: '#F3F3F3',
  },
  exerciseCardLocked: {
    backgroundColor: COLORS.errorLight,
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  exerciseInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.black,
    marginBottom: 4,
  },
  iconContainer: {
    marginTop: 8,
  },
  loader: {
    flex: 1,
  },
});

