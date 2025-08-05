// src/screens/HomeScreen.tsx

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWorkout } from '../context/WorkoutContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    selectedExercises,
    workoutHistory,
    isRestTimerActive,
    restTimeRemaining,
    workoutStartTime,
    clearWorkout,
  } = useWorkout();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWorkoutDuration = (): string => {
    if (!workoutStartTime) return '0m';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - workoutStartTime.getTime()) / 60000);
    return `${diffMinutes}m`;
  };

  const getTotalSets = (exercises: any[]): number => {
    return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const getLastWorkout = () => {
    return workoutHistory.length > 0 ? workoutHistory[0] : null;
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyWorkouts = workoutHistory.filter(
      workout => new Date(workout.date) > weekAgo
    );
    
    const totalSets = weeklyWorkouts.reduce((total, workout) => 
      total + getTotalSets(workout.exercises), 0
    );
    
    const totalVolume = weeklyWorkouts.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.reduce((setTotal, set) => 
          setTotal + set.weight * set.reps, 0
        ), 0
      ), 0
    );

    return {
      workouts: weeklyWorkouts.length,
      sets: totalSets,
      volume: totalVolume,
    };
  };

  const handleContinueWorkout = () => {
    if (selectedExercises.length === 0) {
      Alert.alert(
        'No Active Workout',
        'Start a new workout by adding exercises from the Library.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Library' as never) }
        ]
      );
      return;
    }
    navigation.navigate('Workout' as never);
  };

  const handleNewWorkout = () => {
    if (selectedExercises.length > 0) {
      Alert.alert(
        'Current Workout in Progress',
        'You have an active workout. What would you like to do?',
        [
          { text: 'Continue Current', onPress: () => navigation.navigate('Workout' as never) },
          { text: 'Start New', onPress: () => {
            clearWorkout();
            navigation.navigate('Library' as never);
          }},
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    navigation.navigate('Library' as never);
  };

  const weeklyStats = getWeeklyStats();
  const lastWorkout = getLastWorkout();
  const hasActiveWorkout = selectedExercises.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Tracker</Text>
        <Text style={styles.subtitle}>Track your strength journey</Text>
      </View>

      {/* Current Workout Status */}
      {hasActiveWorkout && (
        <View style={styles.activeWorkoutCard}>
          <View style={styles.activeWorkoutHeader}>
            <Text style={styles.activeWorkoutTitle}>🏋️ Active Workout</Text>
            {isRestTimerActive && (
              <View style={styles.restTimerBadge}>
                <Text style={styles.restTimerText}>Rest: {formatTime(restTimeRemaining)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.activeWorkoutInfo}>
            {selectedExercises.length} exercises • {getTotalSets(selectedExercises)} sets
          </Text>
          {workoutStartTime && (
            <Text style={styles.activeWorkoutDuration}>
              Duration: {getWorkoutDuration()}
            </Text>
          )}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinueWorkout}>
            <Text style={styles.continueButtonText}>Continue Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleNewWorkout}
        >
          <Text style={styles.actionButtonIcon}>💪</Text>
          <Text style={styles.actionButtonText}>
            {hasActiveWorkout ? 'New Workout' : 'Start Workout'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('History' as never)}
        >
          <Text style={styles.actionButtonIcon}>📊</Text>
          <Text style={styles.actionButtonText}>View History</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{weeklyStats.workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{weeklyStats.sets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{weeklyStats.volume.toFixed(0)}kg</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>
      </View>

      {/* Recent History */}
      {lastWorkout && (
        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Last Workout</Text>
          <View style={styles.recentWorkout}>
            <View style={styles.recentWorkoutInfo}>
              <Text style={styles.recentWorkoutName}>{lastWorkout.name}</Text>
              <Text style={styles.recentWorkoutDate}>
                {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.recentWorkoutStats}>
              <Text style={styles.recentStat}>
                {getTotalSets(lastWorkout.exercises)} sets
              </Text>
              {lastWorkout.duration && (
                <Text style={styles.recentStat}>{lastWorkout.duration}m</Text>
              )}
            </View>
          </View>
          <View style={styles.recentExercises}>
            {lastWorkout.exercises.slice(0, 3).map((exercise, index) => (
              <Text key={index} style={styles.recentExercise}>
                • {exercise.name}
              </Text>
            ))}
            {lastWorkout.exercises.length > 3 && (
              <Text style={styles.recentExercise}>
                • +{lastWorkout.exercises.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Exercise Library Preview */}
      <View style={styles.libraryPreview}>
        <Text style={styles.libraryTitle}>Exercise Library</Text>
        <View style={styles.libraryGrid}>
          <View style={styles.libraryItem}>
            <Text style={styles.exerciseIcon}>🏋️</Text>
            <Text style={styles.exerciseName}>Bench Press</Text>
          </View>
          <View style={styles.libraryItem}>
            <Text style={styles.exerciseIcon}>🦵</Text>
            <Text style={styles.exerciseName}>Squat</Text>
          </View>
          <View style={styles.libraryItem}>
            <Text style={styles.exerciseIcon}>💪</Text>
            <Text style={styles.exerciseName}>Deadlift</Text>
          </View>
          <View style={styles.libraryItem}>
            <TouchableOpacity onPress={() => navigation.navigate('Library' as never)}>
              <Text style={styles.exerciseIcon}>➕</Text>
              <Text style={styles.exerciseName}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {workoutHistory.length > 0 
            ? `${workoutHistory.length} total workouts completed`
            : 'Start your first workout to see progress!'
          }
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  activeWorkoutCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  activeWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeWorkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  restTimerBadge: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  restTimerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeWorkoutInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  activeWorkoutDuration: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#007AFF',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  recentWorkout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentWorkoutInfo: {
    flex: 1,
  },
  recentWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recentWorkoutDate: {
    fontSize: 12,
    color: '#666',
  },
  recentWorkoutStats: {
    alignItems: 'flex-end',
  },
  recentStat: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  recentExercises: {
    marginTop: 8,
  },
  recentExercise: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  libraryPreview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  libraryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  libraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  libraryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  exerciseIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});