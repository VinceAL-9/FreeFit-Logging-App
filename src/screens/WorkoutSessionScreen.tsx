import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeProvider';
import { useWorkout } from '../context/WorkoutContext';
import {
  calculateSetVolume,
  getQuickIncrements,
  getWeightIncrement
} from '../utils/weightConversion';

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/* ---------- Unit Toggle ---------- */
const UnitToggle: React.FC<{
  unit: 'kg' | 'lbs';
  onUnitChange: (u: 'kg' | 'lbs') => void;
}> = ({ unit, onUnitChange }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.unitToggleContainer, { borderColor: colors.border }]}>
      {(['kg', 'lbs'] as const).map((u) => (
        <TouchableOpacity
          key={u}
          style={[
            styles.unitToggleButton,
            { backgroundColor: unit === u ? colors.primary : 'transparent' },
          ]}
          onPress={() => onUnitChange(u)}
        >
          <Text
            style={[
              styles.unitToggleText,
              { color: unit === u ? '#fff' : colors.text },
            ]}
          >
            {u.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* ---------- Increment Input ---------- */
const IncrementInput: React.FC<{
  value: string;
  onValueChange: (v: string) => void;
  step?: number;
  min?: number;
  max?: number;
  label: string;
  suffix?: string;
}> = ({
  value,
  onValueChange,
  step = 1,
  min = 0,
  max = 999,
  label,
  suffix = '',
}) => {
  const { colors } = useTheme();

  const inc = () =>
    onValueChange(
      Math.min((parseFloat(value) || 0) + step, max).toString(),
    );

  const dec = () =>
    onValueChange(
      Math.max((parseFloat(value) || 0) - step, min).toString(),
    );

  const onChange = (t: string) =>
    /^\d*\.?\d*$/.test(t) && onValueChange(t);

  return (
    <View style={[styles.incrementContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.incrementLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.incrementRow}>
        <TouchableOpacity
          style={[styles.incrementButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={dec}
        >
          <Text style={[styles.incrementButtonText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={[
            styles.incrementInput,
            { borderColor: colors.border, backgroundColor: colors.background, color: colors.text },
          ]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={[styles.incrementButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={inc}
        >
          <Text style={[styles.incrementButtonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
      {suffix ? (
        <Text style={[styles.incrementSuffix, { color: colors.textSecondary }]}>
          {suffix}
        </Text>
      ) : null}
    </View>
  );
};

/* ---------- Quick Buttons ---------- */
const QuickWeightButtons: React.FC<{
  currentWeight: string;
  onWeightChange: (v: string) => void;
  unit: 'kg' | 'lbs';
}> = ({ currentWeight, onWeightChange, unit }) => {
  const { colors } = useTheme();
  const adds = getQuickIncrements(unit);

  return (
    <View style={styles.quickButtonsContainer}>
      <Text style={[styles.quickButtonsLabel, { color: colors.textSecondary }]}>
        Quick add:
      </Text>
      <View style={styles.quickButtonsRow}>
        {adds.map((inc) => (
          <TouchableOpacity
            key={inc}
            style={[styles.quickButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              onWeightChange(
                ((parseFloat(currentWeight) || 0) + inc).toString(),
              )
            }
          >
            <Text style={styles.quickButtonText}>+{inc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/* ---------- Screen ---------- */
export default function WorkoutSessionScreen() {
  useEffect(() => {
    // Prevent sleep while this screen is active
    activateKeepAwakeAsync();
    return () => {
      // Allow normal screen sleep after leaving
      deactivateKeepAwake();
    };
  }, []);

  const {
    selectedExercises,
    addSetToExercise,
    removeSetFromExercise,
    removeExercise,
    editSetInExercise,
    finishWorkout,
    clearWorkout,
    getExerciseHistory,
    isRestTimerActive,
    restTimeRemaining,
    stopRestTimer,
    workoutStartTime,
    showToast,
    settings,
  } = useWorkout();

  const { colors } = useTheme();

  /* local state */
  const [reps, setReps] = useState('');
  const [wt, setWt] = useState('');
  const [addUnit, setAddUnit] = useState<'kg' | 'lbs'>(settings.weightUnit);
  const [editUnit, setEditUnit] = useState<'kg' | 'lbs'>(settings.weightUnit);
  const [activeEx, setActiveEx] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<{
    exerciseName: string;
    setIndex: number;
  } | null>(null);
  const [editReps, setEditReps] = useState('');
  const [editWt, setEditWt] = useState('');
  const [showHist, setShowHist] = useState<string | null>(null);

  /* helpers */
  const lastSetInfo = (name: string) => {
    const hist = getExerciseHistory(name);
    if (hist.length > 0 && hist[0].sets.length > 0) {
      const session = hist[0]; // Access first element of array
      const ls = session.sets[session.sets.length - 1];
      return `Last: ${ls.reps} reps @ ${ls.weight}${ls.unit}`;
    }
    return 'No previous data';
  };

  /* actions */
  const addSet = (ex: string) => {
    const r = parseInt(reps, 10);
    const w = parseFloat(wt);
    if (r > 0 && w >= 0) {
      addSetToExercise(ex, r, w, addUnit);
      setReps('');
      setWt('');
      setActiveEx(null);
    } else showToast('Enter valid reps/weight', 'error');
  };

  const handleDeleteExercise = (exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to remove "${exerciseName}" from your workout? All sets for this exercise will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeExercise(exerciseName);
            // Clear any active states for this exercise
            if (activeEx === exerciseName) {
              setActiveEx(null);
            }
            if (editMode?.exerciseName === exerciseName) {
              setEditMode(null);
            }
            if (showHist === exerciseName) {
              setShowHist(null);
            }
          },
        },
      ],
    );
  };

  const finish = () =>
    Alert.alert('Finish Workout', 'Save workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: () => {
          finishWorkout();
          showToast('Workout saved!', 'success');
        },
      },
    ]);

  /* empty state */
  if (!selectedExercises.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Exercises Selected
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add exercises from the library to start.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* main render */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.workoutInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Current Workout
          </Text>
          {workoutStartTime && (
            <Text style={[styles.workoutDuration, { color: colors.textSecondary }]}>
              Started: {workoutStartTime.toLocaleTimeString()}
            </Text>
          )}
        </View>
        {isRestTimerActive && (
          <View style={[styles.restTimer, { backgroundColor: colors.primary, borderColor: colors.border }]}>
            <Text style={[styles.restTimerText, { color: '#fff' }]}>
              Rest: {formatTime(restTimeRemaining)}
            </Text>
            <TouchableOpacity
              style={[styles.stopTimerButton, { backgroundColor: colors.primaryDark }]}
              onPress={stopRestTimer}
            >
              <Text style={styles.stopTimerButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* exercise list */}
      <FlatList
        data={selectedExercises}
        keyExtractor={it => it.name}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isActive = activeEx === item.name;
          const isEditing = editMode?.exerciseName === item.name;

          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* header row */}
              <View style={styles.exerciseHeader}>
                <Text 
                  style={[styles.exerciseName, { color: colors.text }]} 
                  numberOfLines={1} 
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.historyButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowHist(showHist === item.name ? null : item.name)}
                  >
                    <Text style={styles.historyButtonText}>
                      {showHist === item.name ? 'Hide' : 'History'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.historyButton, { backgroundColor: colors.error }]}
                    onPress={() => handleDeleteExercise(item.name)}
                  >
                    <Text style={styles.historyButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* history collapse */}
              {showHist === item.name && (
                <View style={[styles.historyContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.historyTitle, { color: colors.text }]}>
                    Previous Sessions:
                  </Text>
                  {getExerciseHistory(item.name).slice(0, 3).map((s, i) => (
                    <View key={i} style={styles.historySession}>
                      <Text style={[styles.historySessionTitle, { color: colors.textSecondary }]}>
                        Session {i + 1}:
                      </Text>
                      {s.sets.map((st, si) => (
                        <Text key={si} style={[styles.historySet, { color: colors.textSecondary }]}>
                          {st.reps} reps @ {st.weight}{st.unit}
                        </Text>
                      ))}
                    </View>
                  ))}
                  {!getExerciseHistory(item.name).length && (
                    <Text style={[styles.noHistory, { color: colors.textSecondary }]}>
                      No previous data
                    </Text>
                  )}
                </View>
              )}

              {/* current sets list */}
              {item.sets.map((st, idx) => {
                // Calculate volume in user's preferred unit for display
                const setVolumeInPreferredUnit = calculateSetVolume(
                  st.reps,
                  st.weight,
                  st.unit,
                  settings.weightUnit
                );

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.setItem, { backgroundColor: colors.background }]}
                    onPress={() =>
                      Alert.alert(
                        `Set ${idx + 1}`,
                        `${st.reps} reps @ ${st.weight}${st.unit} (Vol: ${setVolumeInPreferredUnit.toFixed(1)}${settings.weightUnit})`,
                        [
                          {
                            text: 'Edit',
                            onPress: () => {
                              setEditMode({ exerciseName: item.name, setIndex: idx });
                              setEditReps(st.reps.toString());
                              setEditWt(st.weight.toString());
                              setEditUnit(st.unit);
                            },
                          },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => removeSetFromExercise(item.name, idx),
                          },
                          { text: 'Cancel', style: 'cancel' },
                        ],
                      )
                    }
                  >
                    <Text style={[styles.setText, { color: colors.text }]}>
                      Set {idx + 1}: {st.reps} reps @ {st.weight}{st.unit}
                      {' '}(Vol: {setVolumeInPreferredUnit.toFixed(1)}{settings.weightUnit})
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* edit mode */}
              {isEditing && (
                <View style={[styles.editContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.editTitle, { color: colors.text }]}>
                    Editing Set {editMode!.setIndex + 1}
                  </Text>

                  <UnitToggle unit={editUnit} onUnitChange={setEditUnit} />

                  <View style={styles.enhancedInputColumn}>
                    <IncrementInput
                      value={editReps}
                      onValueChange={setEditReps}
                      step={1}
                      min={1}
                      max={200}
                      label="Reps"
                    />
                    <IncrementInput
                      value={editWt}
                      onValueChange={setEditWt}
                      step={getWeightIncrement(editUnit)}
                      min={0}
                      max={2000}
                      label="Weight"
                      suffix={editUnit}
                    />
                  </View>

                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success }]}
                      onPress={() => {
                        const r = parseInt(editReps, 10);
                        const w = parseFloat(editWt);
                        if (r > 0 && w >= 0) {
                          editSetInExercise(
                            item.name,
                            editMode!.setIndex,
                            r,
                            w,
                            editUnit,
                          );
                          setEditMode(null);
                          setEditReps('');
                          setEditWt('');
                        } else showToast('Enter valid values', 'error');
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

              {/* add-set area */}
              {isActive && !isEditing && (
                <View style={[styles.addSetContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.lastSetInfo, { color: colors.textSecondary }]}>
                    {lastSetInfo(item.name)}
                  </Text>

                  <UnitToggle unit={addUnit} onUnitChange={setAddUnit} />

                  <View style={styles.enhancedInputColumn}>
                    <IncrementInput
                      value={reps}
                      onValueChange={setReps}
                      step={1}
                      min={1}
                      max={200}
                      label="Reps"
                    />
                    <IncrementInput
                      value={wt}
                      onValueChange={setWt}
                      step={getWeightIncrement(addUnit)}
                      min={0}
                      max={2000}
                      label="Weight"
                      suffix={addUnit}
                    />
                  </View>

                  <QuickWeightButtons
                    currentWeight={wt}
                    onWeightChange={setWt}
                    unit={addUnit}
                  />

                  <View style={styles.addSetActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.info }]}
                      onPress={() => {
                        const h = getExerciseHistory(item.name);
                        if (h.length > 0 && h[0].sets.length > 0) {
                          const session = h[0];
                          const ls = session.sets[session.sets.length - 1];
                          setReps(ls.reps.toString());
                          setWt(ls.weight.toString());
                          setAddUnit(ls.unit);
                        }
                      }}
                    >
                      <Text style={styles.actionButtonText}>Fill Last</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success }]}
                      onPress={() => addSet(item.name)}
                    >
                      <Text style={styles.actionButtonText}>Add Set</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* toggle button */}
              <TouchableOpacity
                style={[styles.toggleButton, { backgroundColor: isActive ? colors.textSecondary : colors.primary }]}
                onPress={() => setActiveEx(isActive ? null : item.name)}
              >
                <Text style={styles.toggleButtonText}>
                  {isActive ? 'Cancel' : 'Add Set'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* footer */}
      <View style={[styles.bottomActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: colors.error }]}
          onPress={() =>
            Alert.alert(
              'Clear Workout',
              'Are you sure you want to clear all exercises and sets? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => {
                    clearWorkout();
                    showToast('Workout cleared', 'success');
                  },
                },
              ],
            )
          }
        >
          <Text style={styles.bottomButtonText}>Clear Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: colors.success }]}
          onPress={finish}
        >
          <Text style={styles.bottomButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  workoutInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  workoutDuration: { fontSize: 14 },
  restTimer: { alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, minWidth: 120 },
  restTimerText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  stopTimerButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  stopTimerButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exerciseName: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 8 },
  historyButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  historyButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  historyContainer: { marginBottom: 12, padding: 12, borderRadius: 8 },
  historyTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  historySession: { marginBottom: 6 },
  historySessionTitle: { fontSize: 12, fontWeight: '600' },
  historySet: { fontSize: 12, marginLeft: 8, marginTop: 2 },
  noHistory: { fontSize: 12, fontStyle: 'italic' },
  setItem: { padding: 12, marginVertical: 4, borderRadius: 8 },
  setText: { fontSize: 14, fontWeight: '500' },
  lastSetInfo: { fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  addSetContainer: { marginTop: 12, padding: 16, borderRadius: 8, borderWidth: 1 },
  editContainer: { marginTop: 12, padding: 16, borderRadius: 8, borderWidth: 1 },
  editTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  unitToggleContainer: { flexDirection: 'row', marginBottom: 16, borderRadius: 8, overflow: 'hidden' },
  unitToggleButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1 },
  unitToggleText: { fontSize: 14, fontWeight: '600' },
  enhancedInputColumn: { flexDirection: 'column', gap: 16, marginBottom: 16 },
  incrementContainer: { borderWidth: 1, borderRadius: 8, padding: 12 },
  incrementLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  incrementRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  incrementButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  incrementButtonText: { fontSize: 20, fontWeight: 'bold' },
  incrementInput: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, fontSize: 16, fontWeight: '600', paddingHorizontal: 8, textAlign: 'center' },
  incrementSuffix: { fontSize: 10, textAlign: 'center', marginTop: 4 },
  quickButtonsContainer: { marginBottom: 16 },
  quickButtonsLabel: { fontSize: 12, marginBottom: 8 },
  quickButtonsRow: { flexDirection: 'row', gap: 8 },
  quickButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  quickButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  addSetActions: { flexDirection: 'row', gap: 12 },
  editActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '600' },
  toggleButton: { marginTop: 12, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  toggleButtonText: { color: '#fff', fontWeight: '600' },
  bottomActions: { flexDirection: 'row', gap: 16, padding: 16, borderTopWidth: 1 },
  bottomButton: { flex: 1, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  bottomButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});