// src/screens/WorkoutSessionScreen.tsx

import React, { useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useWorkout } from '../context/WorkoutContext';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function WorkoutSessionScreen() {
  const {
    selectedExercises,
    addSetToExercise,
    removeSetFromExercise,
    editSetInExercise,
    finishWorkout,
    clearWorkout,
    getExerciseHistory,
    isRestTimerActive,
    restTimeRemaining,
    startRestTimer,
    stopRestTimer,
    workoutStartTime,
  } = useWorkout();

  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<{
    exerciseName: string;
    setIndex: number;
  } | null>(null);
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [showHistory, setShowHistory] = useState<string | null>(null);

  const handleAddSet = (exerciseName: string) => {
    const reps = parseInt(repsInput, 10);
    const weight = parseFloat(weightInput);

    if (!isNaN(reps) && !isNaN(weight) && reps > 0 && weight >= 0) {
      addSetToExercise(exerciseName, reps, weight);
      setRepsInput('');
      setWeightInput('');
      setActiveExercise(null);
    } else {
      Alert.alert('Invalid input', 'Please enter valid reps (>0) and weight (≥0).');
    }
  };

  const handleFinishWorkout = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            Alert.prompt(
              'Name Your Workout',
              'Give your workout a name (optional):',
              [
                { text: 'Skip', onPress: () => finishWorkout() },
                { text: 'Save', onPress: (name) => finishWorkout(name) },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  };

  const getLastSetInfo = (exerciseName: string): string => {
    const history = getExerciseHistory(exerciseName);
    if (history.length > 0 && history[0].sets.length > 0) {
      const lastSet = history[0].sets[history[0].sets.length - 1];
      return `Last: ${lastSet.reps} reps @ ${lastSet.weight}kg`;
    }
    return 'No previous data';
  };

  const quickFillFromLast = (exerciseName: string) => {
    const history = getExerciseHistory(exerciseName);
    if (history.length > 0 && history[0].sets.length > 0) {
      const lastSet = history[0].sets[history[0].sets.length - 1];
      setRepsInput(lastSet.reps.toString());
      setWeightInput(lastSet.weight.toString());
    }
  };

  if (selectedExercises.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Exercises Selected</Text>
        <Text style={styles.emptyText}>
          Go to the Exercise Library to add exercises to your workout.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with timer and workout info */}
      <View style={styles.header}>
        <View style={styles.workoutInfo}>
          <Text style={styles.headerTitle}>Current Workout</Text>
          {workoutStartTime && (
            <Text style={styles.workoutDuration}>
              Started: {workoutStartTime.toLocaleTimeString()}
            </Text>
          )}
        </View>
        
        {/* Rest Timer */}
        {isRestTimerActive && (
          <View style={styles.restTimer}>
            <Text style={styles.restTimerText}>Rest: {formatTime(restTimeRemaining)}</Text>
            <Button title="Stop" onPress={stopRestTimer} />
          </View>
        )}
      </View>

      <FlatList
        data={selectedExercises}
        keyExtractor={item => item.name}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <View style={styles.exerciseActions}>
                <Button
                  title={showHistory === item.name ? 'Hide' : 'History'}
                  onPress={() => 
                    setShowHistory(showHistory === item.name ? null : item.name)
                  }
                />
              </View>
            </View>

            {/* Exercise History */}
            {showHistory === item.name && (
              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Previous Sessions:</Text>
                {getExerciseHistory(item.name).slice(0, 3).map((session, index) => (
                  <View key={index} style={styles.historySession}>
                    <Text style={styles.historySessionTitle}>Session {index + 1}:</Text>
                    {session.sets.map((set, setIndex) => (
                      <Text key={setIndex} style={styles.historySet}>
                        {set.reps} reps @ {set.weight}kg
                      </Text>
                    ))}
                  </View>
                ))}
                {getExerciseHistory(item.name).length === 0 && (
                  <Text style={styles.noHistory}>No previous data</Text>
                )}
              </View>
            )}

            {/* Current Sets */}
            {item.sets.map((set, index) => (
              <Pressable
                key={index}
                style={styles.setItem}
                onLongPress={() =>
                  Alert.alert(
                    `Set ${index + 1}`,
                    `${set.reps} reps @ ${set.weight}kg`,
                    [
                      {
                        text: 'Edit',
                        onPress: () => {
                          setEditMode({ exerciseName: item.name, setIndex: index });
                          setEditReps(set.reps.toString());
                          setEditWeight(set.weight.toString());
                        },
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => removeSetFromExercise(item.name, index),
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  )
                }
              >
                <Text style={styles.setText}>
                  Set {index + 1}: {set.reps} reps @ {set.weight}kg
                </Text>
              </Pressable>
            ))}

            {/* Edit Mode */}
            {editMode && editMode.exerciseName === item.name && (
              <View style={styles.editContainer}>
                <Text style={styles.editTitle}>
                  Editing Set {editMode.setIndex + 1}
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    value={editReps}
                    onChangeText={setEditReps}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Weight (kg)"
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.editActions}>
                  <Button
                    title="Save"
                    onPress={() => {
                      const newReps = parseInt(editReps, 10);
                      const newWeight = parseFloat(editWeight);
                      if (!isNaN(newReps) && !isNaN(newWeight) && newReps > 0 && newWeight >= 0) {
                        editSetInExercise(item.name, editMode.setIndex, newReps, newWeight);
                        setEditMode(null);
                        setEditReps('');
                        setEditWeight('');
                      } else {
                        Alert.alert('Invalid input', 'Please enter valid values.');
                      }
                    }}
                  />
                  <Button title="Cancel" onPress={() => setEditMode(null)} />
                </View>
              </View>
            )}

            {/* Add Set Interface */}
            {activeExercise === item.name && !editMode && (
              <View style={styles.addSetContainer}>
                <Text style={styles.lastSetInfo}>{getLastSetInfo(item.name)}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    value={repsInput}
                    onChangeText={setRepsInput}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Weight (kg)"
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.addSetActions}>
                  <Button title="Fill Last" onPress={() => quickFillFromLast(item.name)} />
                  <Button title="Add Set" onPress={() => handleAddSet(item.name)} />
                </View>
              </View>
            )}

            <Button
              title={activeExercise === item.name ? 'Cancel' : 'Add Set'}
              onPress={() =>
                setActiveExercise(activeExercise === item.name ? null : item.name)
              }
            />
          </View>
        )}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button title="Clear Workout" onPress={clearWorkout} color="#ff6b6b" />
        <Button title="Finish Workout" onPress={handleFinishWorkout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  workoutInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutDuration: {
    fontSize: 14,
    color: '#666',
  },
  restTimer: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  restTimerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseActions: {
    flexDirection: 'row',
  },
  historyContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historySession: {
    marginBottom: 4,
  },
  historySessionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  historySet: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  noHistory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  setItem: {
    padding: 8,
    marginVertical: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  setText: {
    fontSize: 14,
  },
  lastSetInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  addSetContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  editContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
  },
  editTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 4,
  },
  addSetActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});