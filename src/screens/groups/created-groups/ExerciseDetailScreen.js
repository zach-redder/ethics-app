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
import { exerciseService } from '../../../services';
import { BottomTabBar, ScreenHeader, Card } from '../../../components';
import { ExerciseMenuModal } from './ExerciseMenuModal';
import { formatters } from '../../../utils';

/**
 * Exercise Detail Screen
 * Screen for viewing exercise details
 */
export const ExerciseDetailScreen = ({ navigation, route }) => {
  const { exerciseId } = route.params || {};
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      loadExercise();
    }
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const { data, error } = await exerciseService.getExerciseById(exerciseId);

      if (error) {
        console.error('Error loading exercise:', error);
        return;
      }

      if (data) {
        setExercise(data);
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseUpdated = () => {
    setShowMenu(false);
    loadExercise();
  };

  const handleExerciseDeleted = () => {
    setShowMenu(false);
    if (exercise?.group_id) {
      navigation.navigate('CreatedGroupDetail', { groupId: exercise.group_id });
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (exercise?.group_id) {
              navigation.navigate('CreatedGroupDetail', { groupId: exercise.group_id });
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
      <ScreenHeader
        title="Exercise not found"
        onBack={() => {
          const { groupId } = route.params || {};
          if (groupId) {
            navigation.navigate('CreatedGroupDetail', { groupId });
          } else {
            navigation.goBack();
          }
        }}
      />
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={exercise.title}
        onBack={() => {
          if (exercise?.group_id) {
            navigation.navigate('CreatedGroupDetail', { groupId: exercise.group_id });
          } else {
            navigation.goBack();
          }
        }}
        rightElement={
          <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.black} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {exercise.description && (
          <Card>
            <Text style={styles.description}>{exercise.description}</Text>
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <Text style={styles.dateText}>
            {formatters.formatDateLongWithYear(exercise.start_date)} - {formatters.formatDateLongWithYear(exercise.end_date)}
          </Text>
        </Card>

        {exercise.frequency_per_day && (
          <Card>
            <Text style={styles.sectionTitle}>Frequency</Text>
            <Text style={styles.frequencyText}>
              {formatters.formatFrequencyRange(exercise.frequency_per_day)}x per day
            </Text>
          </Card>
        )}

        {exercise.instructions && (
          <Card>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </Card>
        )}
      </ScrollView>

      <BottomTabBar navigation={navigation} />

      <ExerciseMenuModal
        visible={showMenu}
        exercise={exercise}
        onClose={() => setShowMenu(false)}
        onExerciseUpdated={handleExerciseUpdated}
        onExerciseDeleted={handleExerciseDeleted}
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
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    padding: 4,
  },
  menuButton: {
    width: 40,
    padding: 4,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  frequencyText: {
    fontSize: 16,
    color: COLORS.black,
  },
  instructionsText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
  },
  loader: {
    flex: 1,
  },
});

