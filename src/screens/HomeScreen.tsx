// src/screens/HomeScreen.tsx

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeProvider';
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
    showToast,
  } = useWorkout();
  const { colors, isDark } = useTheme();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWorkoutDuration = (): string => {
    if (!workoutTimeCheck(workoutStartTime)) return '0m';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - new Date(workoutStartTime!).getTime()) / 60000);
    return `${diffMinutes}m`;
  };

  function workoutTimeCheck(time: Date | null | undefined): time is Date {
    return time instanceof Date;
  }

  const getTotalSets = (exercises: any[]): number => {
    return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const getLastWorkout = () => (workoutHistory.length > 0 ? workoutHistory[0] : null);

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyWorkouts = workoutHistory.filter(workout => new Date(workout.date) > weekAgo);

    const totalSets = weeklyWorkouts.reduce(
      (total, workout) => total + getTotalSets(workout.exercises),
      0,
    );

    const totalVolume = weeklyWorkouts.reduce(
      (total, workout) =>
        total +
        workout.exercises.reduce(
          (exerciseTotal, exercise) =>
            exerciseTotal +
            exercise.sets.reduce((setTotal, set) => setTotal + set.weight * set.reps, 0),
          0,
        ),
      0,
    );

    return {
      workouts: weeklyWorkouts.length,
      sets: totalSets,
      volume: totalVolume,
    };
  };

  const handleContinue = () => {
    if (selectedExercises.length === 0) {
      showToast('No active workout. Add exercises from Library first!', 'info');
      setTimeout(() => {
        navigation.navigate('Library' as never);
      }, 1500);
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
          {
            text: 'Start New',
            onPress: () => {
              clearWorkout();
              navigation.navigate('Library' as never);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }
    navigation.navigate('Library' as never);
  };

  const weeklyStats = getWeeklyStats();
  const lastWorkout = getLastWorkout();
  const hasActiveWorkout = selectedExercises.length > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Workout Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your strength journey</Text>
      </View>

      {/* Current Workout Status */}
      {hasActiveWorkout ? (
        <View
          style={[
            styles.activeWorkoutCard,
            {
              backgroundColor: colors.info + '20',
              borderLeftColor: colors.info,
            },
          ]}
        >
          <View style={styles.activeWorkoutHeader}>
            <Text style={[styles.activeWorkoutTitle, { color: colors.info }]}>🏋️ Active Workout</Text>
            {isRestTimerActive ? (
              <View style={[styles.restTimerBadge, { backgroundColor: colors.info }]}>
                <Text style={styles.restTimerText}>Rest: {formatTime(restTimeRemaining)}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.activeWorkoutInfo, { color: colors.text }]}>
            {selectedExercises.length} exercises • {getTotalSets(selectedExercises)} sets
          </Text>
          {workoutTimeCheck(workoutStartTime) ? (
            <Text style={[styles.activeWorkoutDuration, { color: colors.textSecondary }]}>
              Duration: {getWorkoutDuration()}
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.info }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue Workout</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction, { backgroundColor: colors.primary }]}
          onPress={handleNewWorkout}
        >
          <Text style={styles.actionButtonIcon}>💪</Text>
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>
            {hasActiveWorkout ? 'New Workout' : 'Start Workout'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('History' as never)}
        >
          <Text style={styles.actionButtonIcon}>📊</Text>
          <Text style={[styles.actionButtonText, { color: colors.text }]}>View History</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{weeklyStats.workouts}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{weeklyStats.sets}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {weeklyStats.volume.toFixed(0)} kg
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Volume</Text>
          </View>
        </View>
      </View>

      {/* Recent Workout */}
      {lastWorkout ? (
        <View style={[styles.recentCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.recentTitle, { color: colors.text }]}>Last Workout</Text>
          <View style={styles.recentWorkout}>
            <View style={styles.recentWorkoutInfo}>
              <Text style={[styles.recentWorkoutName, { color: colors.text }]}>{lastWorkout.name}</Text>
              <Text style={[styles.recentWorkoutDate, { color: colors.textSecondary }]}>
                {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.recentWorkoutStats}>
              <Text style={[styles.recentStat, { color: colors.primary }]}>
                {getTotalSets(lastWorkout.exercises)} sets
              </Text>
              {lastWorkout.duration ? (
                <Text style={[styles.recentStat, { color: colors.primary }]}>{lastWorkout.duration}m</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.recentExercises}>
            {lastWorkout.exercises.slice(0, 3).map((exercise, i) => (
              <Text key={i} style={[styles.recentExercise, { color: colors.textSecondary }]}>
                • {exercise.name}
              </Text>
            ))}
            {lastWorkout.exercises.length > 3 ? (
              <Text style={[styles.recentExercise, { color: colors.textSecondary }]}>
                • +{lastWorkout.exercises.length - 3} more
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Exercise Library Preview */}
      <View style={[styles.libraryPreview, { backgroundColor: colors.surface }]}>
        <Text style={[styles.libraryTitle, { color: colors.text }]}>Exercise Library</Text>
        <View style={styles.libraryGrid}>
          <View style={[styles.libraryItem, { backgroundColor: colors.background }]}>
            <Text style={styles.exerciseIcon}>🏋️</Text>
            <Text style={[styles.exerciseName, { color: colors.text }]}>Bench Press</Text>
          </View>
          <View style={[styles.libraryItem, { backgroundColor: colors.background }]}>
            <Text style={styles.exerciseIcon}>🦵</Text>
            <Text style={[styles.exerciseName, { color: colors.text }]}>Squat</Text>
          </View>
          <View style={[styles.libraryItem, { backgroundColor: colors.background }]}>
            <Text style={styles.exerciseIcon}>💪</Text>
            <Text style={[styles.exerciseName, { color: colors.text }]}>Deadlift</Text>
          </View>
          <TouchableOpacity
            style={[styles.libraryItem, { backgroundColor: colors.background }]} 
            onPress={() => navigation.navigate('Library' as never)}
          >
            <Text style={styles.exerciseIcon}>➕</Text>
            <Text style={[styles.exerciseName, { color: colors.text }]}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {workoutHistory.length > 0 ? `${workoutHistory.length} total workouts completed` : 'Start your first workout to see progress!'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16 },
  activeWorkoutCard: { borderRadius: 12, padding: 16, marginBottom: 20, borderLeftWidth: 4 },
  activeWorkoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activeWorkoutTitle: { fontSize: 18, fontWeight: 'bold' },
  restTimerBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  restTimerText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  activeWorkoutInfo: { fontSize: 14, marginBottom: 4 },
  activeWorkoutDuration: { fontSize: 12, marginBottom: 12 },
  continueButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  continueButtonText: { color: '#fff', fontWeight: 'bold' },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  primaryAction: { borderWidth: 0 },
  actionButtonIcon: { fontSize: 24, marginBottom: 8 },
  actionButtonText: { fontSize: 16, fontWeight: '600' },
  statsCard: { borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6e6e6e', marginTop: 4 },
  recentCard: { borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  recentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  recentWorkout: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recentWorkoutInfo: { flex: 1 },
  recentWorkoutName: { fontSize: 16, fontWeight: '600' },
  recentWorkoutDate: { fontSize: 12, color: '#6e6e6e' },
  recentWorkoutStats: { alignItems: 'flex-end' },
  recentStat: { fontSize: 12, fontWeight: '600' },
  recentExercises: { marginTop: 8 },
  recentExercise: { fontSize: 14, marginBottom: 2, color: '#6e6e6e' },
  libraryPreview: { borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  libraryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  libraryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  libraryItem: { flex: 1, minWidth: '45%', alignItems: 'center', padding: 12, borderRadius: 8 },
  exerciseIcon: { fontSize: 20, marginBottom: 4 },
  exerciseName: { fontSize: 12, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 20 },
  footerText: { fontSize: 14, textAlign: 'center' },
});
