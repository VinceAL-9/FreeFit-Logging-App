// src/screens/HistoryScreen.tsx

import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeProvider';
import type { Workout } from '../context/WorkoutContext';
import { useWorkout } from '../context/WorkoutContext';
import { csvForWorkout, exportCSV } from '../utils/exportUtils';

export default function HistoryScreen() {
  const { workoutHistory, showToast, settings } = useWorkout();
  const { colors } = useTheme();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalSets = (workout: Workout): number => {
    return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const getTotalWeight = (workout: Workout): number => {
    return workout.exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce((exerciseTotal, set) => exerciseTotal + set.weight * set.reps, 0),
      0
    );
  };

  // Export a single workout as CSV and share
  const exportWorkoutToFile = async (workout: Workout) => {
    try {
      const csvContent = csvForWorkout(workout);
      const safeName = workout?.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
      const filename = `workout_${safeName}_${Date.now()}.csv`;
      const fileUri = await exportCSV(filename, csvContent);
      showToast(`Workout exported: ${filename}`, 'success');
      return fileUri;
    } catch (error) {
      console.error('Failed to export workout:', error);
      showToast('Failed to export workout', 'error');
    }
  };

  // Export all workouts combined into a single CSV file
  const exportAllWorkoutsToFile = async () => {
    try {
      if (workoutHistory.length === 0) {
        showToast('No workout history to export', 'info');
        return;
      }

      const combinedCsvLines: string[] = [];

      workoutHistory.forEach((workout, index) => {
        const csv = csvForWorkout(workout);
        combinedCsvLines.push(csv);
        if (index !== workoutHistory.length - 1) combinedCsvLines.push(''); // Blank line between workouts
      });

      const combinedCsv = combinedCsvLines.join('\n');
      const filename = `all_workouts_${Date.now()}.csv`;
      const fileUri = await exportCSV(filename, combinedCsv);
      showToast(`All workouts exported: ${filename}`, 'success');
      return fileUri;
    } catch (error) {
      console.error('Failed to export all workouts:', error);
      showToast('Failed to export all workouts', 'error');
    }
  };

  // Placeholder for progress report export
  // You can implement generateProgressReport & exportToFile similar to above
  const exportProgressReport = async () => {
    showToast('Progress report feature is under development.', 'info');
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={[styles.workoutCard, { backgroundColor: colors.surface }]}
      onPress={() => setSelectedWorkout(selectedWorkout?.id === item.id ? null : item)}
      onLongPress={() =>
        Alert.alert(
          'Workout Actions',
          `What would you like to do with "${item.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Export Workout', onPress: () => exportWorkoutToFile(item) },
          ]
        )
      }
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.workoutDate, { color: colors.textSecondary }]}>
            {formatDate(item.date)} at {formatTime(item.date)}
          </Text>
        </View>
        <View style={styles.workoutStats}>
          <Text style={[styles.statText, { color: colors.primary }]}>{getTotalSets(item)} sets</Text>
          {item.duration && <Text style={[styles.statText, { color: colors.primary }]}>{item.duration}m</Text>}
        </View>
      </View>

      <View style={styles.exercisesSummary}>
        {item.exercises.map((exercise, index) => (
          <Text key={index} style={[styles.exerciseSummary, { color: colors.text }]}>
            {exercise.name} ({exercise.sets.length} sets)
          </Text>
        ))}
      </View>

      {selectedWorkout?.id === item.id && (
        <View style={[styles.workoutDetails, { borderTopColor: colors.border }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Workout Details:</Text>
          {item.exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseDetail}>
              <Text style={[styles.exerciseDetailName, { color: colors.text }]}>
                {exercise.name}
              </Text>
              {exercise.sets.map((set, setIndex) => (
                <Text key={setIndex} style={[styles.setDetail, { color: colors.textSecondary }]}>
                  Set {setIndex + 1}: {set.reps} reps @ {set.weight}{set.unit || settings.weightUnit}
                  {' '}(Volume: {(set.reps * set.weight).toFixed(1)}{set.unit || settings.weightUnit})
                </Text>
              ))}
            </View>
          ))}

          <View style={[styles.workoutSummary, { backgroundColor: colors.background }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary:</Text>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Total Volume: {getTotalWeight(item).toFixed(1)}{settings.weightUnit}
            </Text>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Total Sets: {getTotalSets(item)}
            </Text>
            {item.duration && (
              <Text style={[styles.summaryText, { color: colors.text }]}>
                Duration: {item.duration} minutes
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (workoutHistory.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Workout History</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Complete your first workout to see it here!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Workout History</Text>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={() =>
            Alert.alert(
              'Export Options',
              'Choose what to export:',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'All Workouts', onPress: exportAllWorkoutsToFile },
                { text: 'Progress Report', onPress: exportProgressReport },
              ]
            )
          }
        >
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{workoutHistory.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {workoutHistory.reduce((total, workout) => total + getTotalSets(workout), 0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Sets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {workoutHistory
              .reduce((total, workout) => total + getTotalWeight(workout), 0)
              .toFixed(0)}{settings.weightUnit}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Volume</Text>
        </View>
      </View>

      <FlatList
        data={workoutHistory}
        renderItem={renderWorkoutItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  workoutCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exercisesSummary: {
    marginTop: 8,
  },
  exerciseSummary: {
    fontSize: 14,
    marginBottom: 2,
  },
  workoutDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseDetail: {
    marginBottom: 12,
  },
  exerciseDetailName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  setDetail: {
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 2,
  },
  workoutSummary: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    marginBottom: 2,
  },
});
