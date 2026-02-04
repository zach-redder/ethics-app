import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants';
import { groupService, exerciseService, supabase } from '../../../services';
import { BottomTabBar } from '../../../components';
import { AddExerciseModal } from './AddExerciseModal';
import { GroupSettingsModal } from './GroupSettingsModal';

const CARD_HEIGHT = 120; // Approximate height of each exercise card
const CARD_MARGIN = 16;

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
  const [isOwner, setIsOwner] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const scrollViewRef = useRef(null);
  const cardPositions = useRef({});
  const cardRefs = useRef({});
  const exercisesRef = useRef(exercises);
  const draggingFromIndexRef = useRef(null);
  const draggingExerciseIdRef = useRef(null);
  const animValuesRef = useRef({});

  exercisesRef.current = exercises;

  const getOrCreateAnimValues = (exerciseId) => {
    if (!animValuesRef.current[exerciseId]) {
      animValuesRef.current[exerciseId] = {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
      };
    }
    return animValuesRef.current[exerciseId];
  };

  const animateDragStart = (exerciseId) => {
    const anim = getOrCreateAnimValues(exerciseId);
    Animated.parallel([
      Animated.timing(anim.scale, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(anim.opacity, {
        toValue: 0.92,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateDragEnd = (exerciseId) => {
    const anim = getOrCreateAnimValues(exerciseId);
    Animated.parallel([
      Animated.timing(anim.scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(anim.opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

      if (groupResult.data) {
        setGroup(groupResult.data);
        // Check if current user is the owner
        const { data: { user } } = await supabase.auth.getUser();
        setIsOwner(user && groupResult.data.owner_id === user.id);
      }
      if (exercisesResult.data) {
        // Ensure all exercises have display_order
        const exercisesWithOrder = exercisesResult.data.map((ex, index) => ({
          ...ex,
          display_order: ex.display_order || index + 1,
        }));
        setExercises(exercisesWithOrder);
      }
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

  const updateOrder = async (newExercises) => {
    // Update local state immediately
    setExercises(newExercises);
    
    // Update order in database
    const exerciseOrders = newExercises.map((exercise, index) => ({
      id: exercise.id,
      display_order: index + 1,
    }));

    const { error } = await exerciseService.updateExerciseOrder(groupId, exerciseOrders);
    if (error) {
      console.error('Error updating exercise order:', error);
      // Reload on error to restore correct order
      loadGroupData();
    }
  };

  const createPanResponder = (index, exerciseId) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => isOwner,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isOwner && Math.abs(gestureState.dy) > 8;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return isOwner && Math.abs(gestureState.dy) > 8;
      },
      onPanResponderGrant: () => {
        draggingFromIndexRef.current = index;
        draggingExerciseIdRef.current = exerciseId;
        setDraggingIndex(index);
        animateDragStart(exerciseId);
      },
      onPanResponderMove: (_, gestureState) => {
        const fromIndex = draggingFromIndexRef.current;
        if (fromIndex === null || fromIndex === undefined) return;

        const moveY = gestureState.moveY;
        const positions = cardPositions.current;
        const list = exercisesRef.current;
        if (!list || list.length === 0) return;

        // Build sorted list of slot centers (by position on screen)
        const entries = list
          .map((_, i) => ({ index: i, layout: positions[i] }))
          .filter((e) => e.layout && e.layout.height != null)
          .map((e) => ({ index: e.index, centerY: e.layout.y + e.layout.height / 2 }))
          .sort((a, b) => a.centerY - b.centerY);

        if (entries.length === 0) return;

        let targetIndex = fromIndex;
        for (let i = 0; i < entries.length; i++) {
          if (moveY <= entries[i].centerY) {
            targetIndex = entries[i].index;
            break;
          }
          targetIndex = entries[i].index;
        }

        if (targetIndex !== fromIndex && targetIndex >= 0 && targetIndex < list.length) {
          const newExercises = [...list];
          const [removed] = newExercises.splice(fromIndex, 1);
          newExercises.splice(targetIndex, 0, removed);
          exercisesRef.current = newExercises;
          setExercises(newExercises);
          draggingFromIndexRef.current = targetIndex;
        }
      },
      onPanResponderRelease: () => {
        const exerciseId = draggingExerciseIdRef.current;
        if (exerciseId) animateDragEnd(exerciseId);
        draggingExerciseIdRef.current = null;
        const list = exercisesRef.current;
        if (draggingFromIndexRef.current !== null && list.length > 0) {
          updateOrder(list);
        }
        draggingFromIndexRef.current = null;
        setDraggingIndex(null);
      },
    });
  };

  const renderExerciseItem = (exercise, index) => {
    const panResponder = isOwner ? createPanResponder(index, exercise.id) : null;
    const isDragging = draggingIndex === index;
    const panHandlers = panResponder?.panHandlers || {};
    const anim = getOrCreateAnimValues(exercise.id);

    return (
      <View
        key={exercise.id}
        ref={(el) => { cardRefs.current[index] = el; }}
        onLayout={() => {
          const node = cardRefs.current[index];
          if (node && node.measureInWindow) {
            node.measureInWindow((x, y, width, height) => {
              cardPositions.current[index] = { y, height };
            });
          }
        }}
        style={[
          styles.exerciseCardWrapper,
          isDragging && styles.exerciseCardDragging,
        ]}
        {...panHandlers}
      >
        <Animated.View
          style={[
            styles.exerciseCard,
            isExerciseActive(exercise)
              ? styles.exerciseCardActive
              : styles.exerciseCardInactive,
            {
              opacity: anim.opacity,
              transform: [{ scale: anim.scale }],
            },
          ]}
        >
          {isOwner && (
            <TouchableOpacity
              style={styles.dragHandle}
              activeOpacity={0.7}
            >
              <Ionicons name="reorder-three-outline" size={24} color={COLORS.black} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.exerciseContent}
            onPress={() =>
              !isDragging &&
              navigation.navigate('ExerciseDetail', { 
                exerciseId: exercise.id,
                groupId: groupId 
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.exerciseTitle}>{exercise.title}</Text>
            <Text style={styles.exerciseDescription} numberOfLines={2}>
              {exercise.description || 'No description'}
            </Text>
          </TouchableOpacity>
          <View style={styles.exerciseDates}>
            <Text style={styles.dateText}>
              Starts: {formatDate(exercise.start_date)}
            </Text>
            <Text style={styles.dateText}>
              Ends: {formatDate(exercise.end_date)}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
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

      <ScrollView 
        ref={scrollViewRef}
        style={styles.contentWrapper} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={draggingIndex === null}
      >
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises yet!</Text>
          </View>
        ) : (
          exercises.map((exercise, index) => renderExerciseItem(exercise, index))
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
  contentWrapper: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 24,
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
  exerciseCardWrapper: {
    marginBottom: CARD_MARGIN,
  },
  exerciseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseCardDragging: {
    zIndex: 1000,
  },
  dragHandle: {
    marginRight: 12,
    padding: 4,
    justifyContent: 'center',
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
