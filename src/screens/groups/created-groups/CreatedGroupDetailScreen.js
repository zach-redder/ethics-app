import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { groupService, exerciseService } from '../../../services';
import { formatters } from '../../../utils';
import { BottomTabBar } from '../../../components';
import { AddExerciseModal } from './AddExerciseModal';
import { GroupSettingsModal } from './GroupSettingsModal';

/**
 * Created Group Detail Screen
 * Main screen for viewing a created group with exercises
 */
export const CreatedGroupDetailScreen = ({ navigation, route }) => {
  const { groupId } = route.params || {};
  const [group, setGroup] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  const handleExerciseAdded = () => {
    setShowAddExercise(false);
    loadGroupData();
  };

  const handleGroupUpdated = () => {
    setShowSettings(false);
    loadGroupData();
  };

  const handleGroupDeleted = () => {
    setShowSettings(false);
    navigation.goBack();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isExerciseActive = (exercise) => {
    return exerciseService.isExerciseActive(exercise);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard', { initialTab: 'created' })}
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
            onPress={() => navigation.navigate('Dashboard', { initialTab: 'created' })}
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
          onPress={() => navigation.navigate('Dashboard', { initialTab: 'created' })}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <Text style={styles.groupCode}>
        <Text style={styles.groupCodeLabel}>Group Code: </Text>
        {group.group_code}
      </Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises yet!</Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                isExerciseActive(exercise)
                  ? styles.exerciseCardActive
                  : styles.exerciseCardInactive,
              ]}
              onPress={() =>
                navigation.navigate('ExerciseDetail', { 
                  exerciseId: exercise.id,
                  groupId: groupId 
                })
              }
            >
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseDescription} numberOfLines={2}>
                  {exercise.description || 'No description'}
                </Text>
              </View>
              <View style={styles.exerciseDates}>
                <Text style={styles.dateText}>
                  Starts: {formatDate(exercise.start_date)}
                </Text>
                <Text style={styles.dateText}>
                  Ends: {formatDate(exercise.end_date)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddExercise(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add Exercise</Text>
      </TouchableOpacity>

      <BottomTabBar navigation={navigation} />

      <AddExerciseModal
        visible={showAddExercise}
        groupId={groupId}
        onClose={() => setShowAddExercise(false)}
        onExerciseAdded={handleExerciseAdded}
      />

      <GroupSettingsModal
        visible={showSettings}
        group={group}
        onClose={() => setShowSettings(false)}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
        navigation={navigation}
      />
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
  settingsButton: {
    width: 40,
    padding: 4,
    alignItems: 'flex-end',
  },
  groupCode: {
    fontSize: 16,
    color: COLORS.black,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  groupCodeLabel: {
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  exerciseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseCardActive: {
    backgroundColor: '#A8D5A8',
  },
  exerciseCardInactive: {
    backgroundColor: '#D5A8A8',
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
  exerciseDates: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.black,
    marginBottom: 4,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 110,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
  },
});

