// src/screens/HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeProvider';
import { useWorkout } from '../context/WorkoutContext';
import { calculateTotalVolumeForSets } from '../utils/weightConversion';

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
    settings,
  } = useWorkout();
  const { colors, fonts, isDark } = useTheme();

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

  // Updated to use unit conversion for consistent volume calculation
  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyWorkouts = workoutHistory.filter(workout => new Date(workout.date) > weekAgo);

    const totalSets = weeklyWorkouts.reduce(
      (total, workout) => total + getTotalSets(workout.exercises),
      0,
    );

    // Calculate total volume in preferred unit, converting all sets weights accordingly
    const totalVolume = weeklyWorkouts.reduce((total, workout) => {
      const workoutVolume = workout.exercises.reduce((exTotal, exercise) => {
        return exTotal + calculateTotalVolumeForSets(exercise.sets, settings.weightUnit);
      }, 0);
      return total + workoutVolume;
    }, 0);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Branded Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/freefit-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Log your workouts and track your progress
          </Text>
        </View>

        {/* Current Workout Status */}
        {hasActiveWorkout ? (
          <View
            style={[
              styles.activeWorkoutCard,
              {
                backgroundColor: colors.primaryLight + '20',
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <View style={styles.activeWorkoutHeader}>
              <Text style={[styles.activeWorkoutTitle, { color: colors.primary, fontFamily: fonts.heading }]}>
                🏋️ Active Workout
              </Text>
              {isRestTimerActive ? (
                <View style={[styles.restTimerBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.restTimerText, { fontFamily: fonts.bodyBold }]}>
                    Rest: {formatTime(restTimeRemaining)}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.activeWorkoutInfo, { color: colors.text, fontFamily: fonts.body }]}>
              {selectedExercises.length} exercises • {getTotalSets(selectedExercises)} sets
            </Text>
            {workoutTimeCheck(workoutStartTime) ? (
              <Text style={[styles.activeWorkoutDuration, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Duration: {getWorkoutDuration()}
              </Text>
            ) : null}
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: colors.primary }]}
              onPress={handleContinue}
            >
              <Text style={[styles.continueButtonText, { fontFamily: fonts.bodyBold }]}>Continue Workout</Text>
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
            <Text style={[styles.actionButtonText, { color: '#fff', fontFamily: fonts.heading }]}>
              {hasActiveWorkout ? 'New Workout' : 'Start Workout'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('History' as never)}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={[styles.actionButtonText, { color: colors.text, fontFamily: fonts.heading }]}>View History</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text, fontFamily: fonts.heading }]}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary, fontFamily: fonts.brand }]}>{weeklyStats.workouts}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary, fontFamily: fonts.brand }]}>{weeklyStats.sets}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary, fontFamily: fonts.brand }]}>
                {weeklyStats.volume.toFixed(0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {settings.weightUnit} Volume
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Workout */}
        {lastWorkout ? (
          <View style={[styles.recentCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.recentTitle, { color: colors.text, fontFamily: fonts.heading }]}>Last Workout</Text>
            <View style={styles.recentWorkout}>
              <View style={styles.recentWorkoutInfo}>
                <Text style={[styles.recentWorkoutName, { color: colors.text, fontFamily: fonts.bodyMedium }]}>{lastWorkout.name}</Text>
                <Text style={[styles.recentWorkoutDate, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.recentWorkoutStats}>
                <Text style={[styles.recentStat, { color: colors.primary, fontFamily: fonts.bodyMedium }]}>
                  {getTotalSets(lastWorkout.exercises)} sets
                </Text>
                {lastWorkout.duration ? (
                  <Text style={[styles.recentStat, { color: colors.primary, fontFamily: fonts.bodyMedium }]}>{lastWorkout.duration}m</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.recentExercises}>
              {lastWorkout.exercises.slice(0, 3).map((exercise, i) => (
                <Text key={i} style={[styles.recentExercise, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  • {exercise.name}
                </Text>
              ))}
              {lastWorkout.exercises.length > 3 ? (
                <Text style={[styles.recentExercise, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  • +{lastWorkout.exercises.length - 3} more
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Exercise Library Preview */}
        <View style={[styles.libraryPreview, { backgroundColor: colors.surface }]}>
          <Text style={[styles.libraryTitle, { color: colors.text, fontFamily: fonts.heading }]}>Exercise Library</Text>
          <View style={styles.libraryGrid}>
            <View style={[styles.libraryItem, { backgroundColor: colors.background }]}>
              <Text style={styles.exerciseIcon}>🏋️</Text>
              <Text style={[styles.exerciseName, { color: colors.text, fontFamily: fonts.body }]}>Bench Press</Text>
            </View>
            <View style={[styles.libraryItem, { backgroundColor: colors.background }]}>
              <Text style={styles.exerciseIcon}>🦵</Text>
              <Text style={[styles.exerciseName, { color: colors.text, fontFamily: fonts.body }]}>Squat</Text>
            </View>
            <View style={[styles.libraryItem, { backgroundColor: colors.background }]}>
              <Text style={styles.exerciseIcon}>💪</Text>
              <Text style={[styles.exerciseName, { color: colors.text, fontFamily: fonts.body }]}>Deadlift</Text>
            </View>
            <TouchableOpacity
              style={[styles.libraryItem, { backgroundColor: colors.background }]}
              onPress={() => navigation.navigate('Library' as never)}
            >
              <Text style={styles.exerciseIcon}>➕</Text>
              <Text style={[styles.exerciseName, { color: colors.text, fontFamily: fonts.body }]}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            {workoutHistory.length > 0 ? `${workoutHistory.length} total workouts completed` : 'Start your first workout to see progress!'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  header: { 
    alignItems: 'center', 
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 10,
  },
  subtitle: { 
    fontSize: 16,
  },
  activeWorkoutCard: { 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 24, 
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activeWorkoutHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  activeWorkoutTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  restTimerBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  restTimerText: { 
    color: '#fff', 
    fontSize: 12 
  },
  activeWorkoutInfo: { 
    fontSize: 16, 
    marginBottom: 6 
  },
  activeWorkoutDuration: { 
    fontSize: 14, 
    marginBottom: 16 
  },
  continueButton: { 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  continueButtonText: { 
    color: '#fff', 
    fontSize: 16 
  },
  quickActions: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 24 
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  primaryAction: { borderWidth: 0 },
  actionButtonIcon: { 
    fontSize: 28, 
    marginBottom: 12 
  },
  actionButtonText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  statsCard: { 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  statsTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  statItem: { 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  statLabel: { 
    fontSize: 14, 
    marginTop: 6 
  },
  recentCard: { 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  recentTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  recentWorkout: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  recentWorkoutInfo: { 
    flex: 1 
  },
  recentWorkoutName: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  recentWorkoutDate: { 
    fontSize: 14 
  },
  recentWorkoutStats: { 
    alignItems: 'flex-end' 
  },
  recentStat: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  recentExercises: { 
    marginTop: 12 
  },
  recentExercise: { 
    fontSize: 16, 
    marginBottom: 4 
  },
  libraryPreview: { 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  libraryTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  libraryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  libraryItem: { 
    flex: 1, 
    minWidth: '45%', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12 
  },
  exerciseIcon: { 
    fontSize: 24, 
    marginBottom: 8 
  },
  exerciseName: { 
    fontSize: 14, 
    textAlign: 'center' 
  },
  footer: { 
    alignItems: 'center', 
    marginTop: 24, 
    paddingBottom: 24 
  },
  footerText: { 
    fontSize: 16, 
    textAlign: 'center' 
  },
});
