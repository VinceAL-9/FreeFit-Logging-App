// src/screens/HistoryScreen.tsx

import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeProvider';
import type { Workout } from '../context/WorkoutContext';
import { useWorkout } from '../context/WorkoutContext';

export default function HistoryScreen() {
  const { workoutHistory } = useWorkout();
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

  const exportWorkoutToCSV = (workout: Workout) => {
    let csvContent = 'Exercise,Set,Reps,Weight (kg),Volume (kg),Timestamp\\n';
    
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach((set, index) => {
        const volume = set.reps * set.weight;
        const timestamp = new Date(set.timestamp).toLocaleString();
        csvContent += `"${exercise.name}",${index + 1},${set.reps},${set.weight},${volume},"${timestamp}"\\n`;
      });
    });

    // Add workout summary
    csvContent += '\\n--- Workout Summary ---\\n';
    csvContent += `Workout Name,"${workout.name}"\\n`;
    csvContent += `Date,"${formatDate(workout.date)}"\\n`;
    csvContent += `Duration (minutes),${workout.duration || 'N/A'}\\n`;
    csvContent += `Total Sets,${getTotalSets(workout)}\\n`;
    csvContent += `Total Volume (kg),${getTotalWeight(workout)}\\n`;

    Share.share({
      message: csvContent,
      title: `${workout.name} - Workout Data`,
    });
  };

  const exportAllWorkoutsToCSV = () => {
    if (workoutHistory.length === 0) {
      Alert.alert('No Data', 'No workout history to export.');
      return;
    }

    let csvContent = 'Date,Workout Name,Exercise,Set,Reps,Weight (kg),Volume (kg),Duration (min)\\n';
    
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach((set, index) => {
          const volume = set.reps * set.weight;
          const workoutDate = new Date(workout.date).toLocaleDateString();
          csvContent += `"${workoutDate}","${workout.name}","${exercise.name}",${index + 1},${set.reps},${set.weight},${volume},${workout.duration || 'N/A'}\\n`;
        });
      });
    });

    Share.share({
      message: csvContent,
      title: 'All Workouts Data',
    });
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={[styles.workoutCard, { backgroundColor: colors.surface }]}
      onPress={() => setSelectedWorkout(selectedWorkout?.id === item.id ? null : item)}
      onLongPress={() =>
        Alert.alert(
          'Export Workout',
          'Would you like to export this workout data?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Export CSV', onPress: () => exportWorkoutToCSV(item) },
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
              <Text style={styles.exerciseDetailName}>{exercise.name}</Text>
              {exercise.sets.map((set, setIndex) => (
                <Text key={setIndex} style={styles.setDetail}>
                  Set {setIndex + 1}: {set.reps} reps @ {set.weight}kg
                  {' '}(Volume: {(set.reps * set.weight).toFixed(1)}kg)
                </Text>
              ))}
            </View>
          ))}
          <View style={styles.workoutSummary}>
            <Text style={styles.summaryTitle}>Summary:</Text>
            <Text style={styles.summaryText}>
              Total Volume: {getTotalWeight(item).toFixed(1)}kg
            </Text>
            <Text style={styles.summaryText}>
              Total Sets: {getTotalSets(item)}
            </Text>
            {item.duration && (
              <Text style={styles.summaryText}>
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
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Workout History</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Complete your first workout to see it here!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Workout History</Text>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={exportAllWorkoutsToCSV}
        >
          <Text style={styles.exportButtonText}>Export All</Text>
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
              .toFixed(0)}kg
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    color: '#666',
  },
  workoutCard: {
    backgroundColor: '#fff',
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
    color: '#666',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  exercisesSummary: {
    marginTop: 8,
  },
  exerciseSummary: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  workoutDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    color: '#666',
    marginLeft: 8,
    marginBottom: 2,
  },
  workoutSummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
});
