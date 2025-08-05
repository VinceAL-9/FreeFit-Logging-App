// src/screens/WorkoutSessionScreen.tsx

import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeProvider';
import { useWorkout } from '../context/WorkoutContext';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Increment/Decrement Component
const IncrementInput: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  label: string;
  suffix?: string;
}> = ({ value, onValueChange, step = 1, min = 0, max = 999, label, suffix = '' }) => {
  const { colors } = useTheme();

  const increment = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.min(currentValue + step, max);
    onValueChange(newValue.toString());
  };

  const decrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(currentValue - step, min);
    onValueChange(newValue.toString());
  };

  const handleTextChange = (text: string) => {
    // Allow decimal numbers
    const numericValue = text.replace(/[^0-9.]/g, '');
    onValueChange(numericValue);
  };

  return (
    <View style={[styles.incrementContainer, { borderColor: colors.border }]}>
      <Text style={[styles.incrementLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.incrementRow}>
        <TouchableOpacity
          style={[styles.incrementButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={decrement}
          activeOpacity={0.7}
        >
          <Text style={[styles.incrementButtonText, { color: colors.text }]}>−</Text>
        </TouchableOpacity>
        
        <TextInput
          style={[styles.incrementInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          value={value}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          textAlign="center"
          selectTextOnFocus
        />
        
        <TouchableOpacity
          style={[styles.incrementButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={increment}
          activeOpacity={0.7}
        >
          <Text style={[styles.incrementButtonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
      {suffix && <Text style={[styles.incrementSuffix, { color: colors.textSecondary }]}>{suffix}</Text>}
    </View>
  );
};

// Quick Weight Buttons Component  
const QuickWeightButtons: React.FC<{
  currentWeight: string;
  onWeightChange: (weight: string) => void;
}> = ({ currentWeight, onWeightChange }) => {
  const { colors } = useTheme();
  
  const quickIncrements = [2.5, 5, 10, 20];

  const addWeight = (increment: number) => {
    const current = parseFloat(currentWeight) || 0;
    onWeightChange((current + increment).toString());
  };

  return (
    <View style={styles.quickButtonsContainer}>
      <Text style={[styles.quickButtonsLabel, { color: colors.textSecondary }]}>Quick add:</Text>
      <View style={styles.quickButtonsRow}>
        {quickIncrements.map((increment) => (
          <TouchableOpacity
            key={increment}
            style={[styles.quickButton, { backgroundColor: colors.primary }]}
            onPress={() => addWeight(increment)}
            activeOpacity={0.8}
          >
            <Text style={styles.quickButtonText}>+{increment}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
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
    showToast,
  } = useWorkout();

  const { colors, isDark } = useTheme();

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
      showToast('Please enter valid reps (>0) and weight (≥0)', 'error');
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
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Exercises Selected</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Go to the Exercise Library to add exercises to your workout.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with timer and workout info */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.workoutInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Current Workout</Text>
          {workoutStartTime && (
            <Text style={[styles.workoutDuration, { color: colors.textSecondary }]}>
              Started: {workoutStartTime.toLocaleTimeString()}
            </Text>
          )}
        </View>
        
        {/* Rest Timer */}
        {isRestTimerActive && (
          <View style={[styles.restTimer, { backgroundColor: colors.info + '20', borderColor: colors.info }]}>
            <Text style={[styles.restTimerText, { color: colors.info }]}>
              Rest: {formatTime(restTimeRemaining)}
            </Text>
            <TouchableOpacity
              style={[styles.stopTimerButton, { backgroundColor: colors.error }]}
              onPress={stopRestTimer}
            >
              <Text style={styles.stopTimerButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={selectedExercises}
        keyExtractor={item => item.name}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.exerciseHeader}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={[styles.historyButton, { backgroundColor: colors.primary }]}
                  onPress={() => 
                    setShowHistory(showHistory === item.name ? null : item.name)
                  }
                >
                  <Text style={styles.historyButtonText}>
                    {showHistory === item.name ? 'Hide' : 'History'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Exercise History */}
            {showHistory === item.name && (
              <View style={[styles.historyContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>Previous Sessions:</Text>
                {getExerciseHistory(item.name).slice(0, 3).map((session, index) => (
                  <View key={index} style={styles.historySession}>
                    <Text style={[styles.historySessionTitle, { color: colors.textSecondary }]}>
                      Session {index + 1}:
                    </Text>
                    {session.sets.map((set, setIndex) => (
                      <Text key={setIndex} style={[styles.historySet, { color: colors.textSecondary }]}>
                        {set.reps} reps @ {set.weight}kg
                      </Text>
                    ))}
                  </View>
                ))}
                {getExerciseHistory(item.name).length === 0 && (
                  <Text style={[styles.noHistory, { color: colors.textSecondary }]}>No previous data</Text>
                )}
              </View>
            )}

            {/* Current Sets */}
            {item.sets.map((set, index) => (
              <Pressable
                key={index}
                style={[styles.setItem, { backgroundColor: colors.background }]}
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
                <Text style={[styles.setText, { color: colors.text }]}>
                  Set {index + 1}: {set.reps} reps @ {set.weight}kg
                </Text>
              </Pressable>
            ))}

            {/* Edit Mode */}
            {editMode && editMode.exerciseName === item.name && (
              <View style={[styles.editContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
                <Text style={[styles.editTitle, { color: colors.text }]}>
                  Editing Set {editMode.setIndex + 1}
                </Text>
                <View style={styles.enhancedInputRow}>
                  <IncrementInput
                    value={editReps}
                    onValueChange={setEditReps}
                    label="Reps"
                    min={1}
                    max={100}
                  />
                  <IncrementInput
                    value={editWeight}
                    onValueChange={setEditWeight}
                    step={2.5}
                    label="Weight"
                    suffix="kg"
                    max={500}
                  />
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => {
                      const newReps = parseInt(editReps, 10);
                      const newWeight = parseFloat(editWeight);
                      if (!isNaN(newReps) && !isNaN(newWeight) && newReps > 0 && newWeight >= 0) {
                        editSetInExercise(item.name, editMode.setIndex, newReps, newWeight);
                        setEditMode(null);
                        setEditReps('');
                        setEditWeight('');
                      } else {
                        showToast('Please enter valid values', 'error');
                      }
                    }}
                  >
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
                    onPress={() => setEditMode(null)}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Add Set Interface */}
            {activeExercise === item.name && !editMode && (
              <View style={[styles.addSetContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.lastSetInfo, { color: colors.textSecondary }]}>
                  {getLastSetInfo(item.name)}
                </Text>
                
                <View style={styles.enhancedInputRow}>
                  <IncrementInput
                    value={repsInput}
                    onValueChange={setRepsInput}
                    label="Reps"
                    min={1}
                    max={100}
                  />
                  <IncrementInput
                    value={weightInput}
                    onValueChange={setWeightInput}
                    step={2.5}
                    label="Weight"
                    suffix="kg"
                    max={500}
                  />
                </View>

                <QuickWeightButtons
                  currentWeight={weightInput}
                  onWeightChange={setWeightInput}
                />

                <View style={styles.addSetActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
                    onPress={() => quickFillFromLast(item.name)}
                  >
                    <Text style={styles.actionButtonText}>Fill Last</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => handleAddSet(item.name)}
                  >
                    <Text style={styles.actionButtonText}>Add Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.toggleButton, { 
                backgroundColor: activeExercise === item.name ? colors.textSecondary : colors.primary 
              }]}
              onPress={() =>
                setActiveExercise(activeExercise === item.name ? null : item.name)
              }
            >
              <Text style={styles.toggleButtonText}>
                {activeExercise === item.name ? 'Cancel' : 'Add Set'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: colors.error }]}
          onPress={clearWorkout}
        >
          <Text style={styles.bottomButtonText}>Clear Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: colors.success }]}
          onPress={handleFinishWorkout}
        >
          <Text style={styles.bottomButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
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
  },
  restTimer: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
  },
  restTimerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stopTimerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  stopTimerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseActions: {
    flexDirection: 'row',
  },
  historyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  historyContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  historySession: {
    marginBottom: 6,
  },
  historySessionTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  historySet: {
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  noHistory: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  setItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  setText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastSetInfo: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  addSetContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  editContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  editTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  enhancedInputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  incrementContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  incrementLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  incrementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incrementButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  incrementInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  incrementSuffix: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  quickButtonsContainer: {
    marginBottom: 16,
  },
  quickButtonsLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addSetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderTopWidth: 1,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});