// src/context/WorkoutContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { playRestTimerSound } from '../utils/sound';

export interface Set {
  reps: number;
  weight: number;
  timestamp: string;
  unit: 'kg' | 'lbs';
}

export interface Exercise {
  name: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
  name?: string;
  duration?: number;
}

export interface Settings {
  restTimerDuration: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  weightUnit: 'kg' | 'lbs';
}

interface WorkoutContextType {
  selectedExercises: Exercise[];
  addExercise: (exercise: { name: string }) => void;
  addSetToExercise: (exerciseName: string, reps: number, weight: number, unit: 'kg' | 'lbs') => void;
  removeSetFromExercise: (exerciseName: string, setIndex: number) => void;
  editSetInExercise: (exerciseName: string, setIndex: number, reps: number, weight: number, unit: 'kg' | 'lbs') => void;
  finishWorkout: (workoutName?: string) => Promise<void>;
  clearWorkout: () => void;
  workoutHistory: Workout[];
  getExerciseHistory: (exerciseName: string) => Exercise[];
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  workoutStartTime: Date | null;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORKOUT_HISTORY: '@workout_history',
  CURRENT_WORKOUT: '@current_workout',
  SETTINGS: '@settings',
};

const DEFAULT_SETTINGS: Settings = {
  restTimerDuration: 180, // 3 minutes
  soundEnabled: true,
  hapticsEnabled: true,
  theme: 'system',
  weightUnit: 'kg',
};

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const restTimerRef = useRef<any>(null); // or useRef<number | null>(null)
  const toastTimeoutRef = useRef<any>(null);

  // Load data on component mount
  useEffect(() => {
    loadWorkoutHistory();
    loadCurrentWorkout();
    loadSettings();
  }, []);

  // Auto-save current workout when it changes
  useEffect(() => {
    saveCurrentWorkout();
  }, [selectedExercises]);

  const loadSettings = async () => {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const loadWorkoutHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      if (historyData) {
        setWorkoutHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
    }
  };

  const saveWorkoutHistory = async (history: Workout[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving workout history:', error);
    }
  };

  const loadCurrentWorkout = async () => {
    try {
      const currentWorkoutData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);
      if (currentWorkoutData) {
        const parsed = JSON.parse(currentWorkoutData);
        setSelectedExercises(parsed.exercises || []);
        if (parsed.startTime) {
          setWorkoutStartTime(new Date(parsed.startTime));
        }
      }
    } catch (error) {
      console.error('Error loading current workout:', error);
    }
  };

  const saveCurrentWorkout = async () => {
    try {
      const workoutData = {
        exercises: selectedExercises,
        startTime: workoutStartTime?.toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(workoutData));
    } catch (error) {
      console.error('Error saving current workout:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    // Auto-hide toast after 3 seconds
    toastTimeoutRef.current = setTimeout(() => { // Type 'number' is not assignable to type 'Timeout'.
      setToastVisible(false);
    }, 3000);
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (!settings.hapticsEnabled) return;
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      // Fallback to vibration
      const patterns = {
        light: 50,
        medium: 100,
        heavy: 200,
        success: [100, 50, 100],
        error: [100, 50, 100, 50, 100],
      };
      Vibration.vibrate(patterns[type]);
    }
  };

  const addExercise = (exercise: { name: string }) => {
    const existingExercise = selectedExercises.find(ex => ex.name === exercise.name);
    if (existingExercise) {
      showToast(`${exercise.name} is already in your workout`, 'error');
      return;
    }

    const newExercise: Exercise = {
      name: exercise.name,
      sets: [],
    };

    setSelectedExercises(prev => [...prev, newExercise]);
    // Start workout timer if this is the first exercise
    if (selectedExercises.length === 0) {
      setWorkoutStartTime(new Date());
    }

    showToast(`${exercise.name} added to workout`, 'success');
    triggerHaptic('light');
  };

  const addSetToExercise = (exerciseName: string, reps: number, weight: number, unit: 'kg' | 'lbs') => {
    const newSet: Set = {
      reps,
      weight,
      unit, // Now passed from UI
      timestamp: new Date().toISOString(),
    };

    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.name === exerciseName
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );

    // Auto-start rest timer after adding a set
    startRestTimer();
    showToast(`Set logged: ${reps} reps @ ${weight}${unit}`, 'success');
    triggerHaptic('medium');
  };

  const removeSetFromExercise = (exerciseName: string, setIndex: number) => {
    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.name === exerciseName
          ? { ...exercise, sets: exercise.sets.filter((_, index) => index !== setIndex) }
          : exercise
      )
    );

    showToast('Set deleted', 'info');
    triggerHaptic('error');
  };

  const editSetInExercise = (exerciseName: string, setIndex: number, reps: number, weight: number, unit: 'kg' | 'lbs') => {
    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.name === exerciseName
          ? {
              ...exercise,
              sets: exercise.sets.map((set, index) =>
                index === setIndex
                  ? { ...set, reps, weight, unit, timestamp: new Date().toISOString() }
                  : set
              ),
            }
          : exercise
      )
    );

    showToast(`Set updated: ${reps} reps @ ${weight}${unit}`, 'success');
    triggerHaptic('light');
  };

  const startRestTimer = (seconds: number = settings.restTimerDuration) => {
  // Clear any existing timer
  if (restTimerRef.current) {
    clearInterval(restTimerRef.current);
  }

  setRestTimeRemaining(seconds);
  setIsRestTimerActive(true);

  restTimerRef.current = setInterval(() => {
    setRestTimeRemaining(prev => {
      if (prev <= 1) {
        // Timer finished
        setIsRestTimerActive(false);
        clearInterval(restTimerRef.current!);
        
        // Play sound if enabled in settings
        if (settings.soundEnabled) {
          playRestTimerSound();
        }
        
        showToast('Rest time finished!', 'success');
        triggerHaptic('success');
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

  const stopRestTimer = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    setIsRestTimerActive(false);
    setRestTimeRemaining(0);
  };

  const finishWorkout = async (workoutName?: string) => {
    if (selectedExercises.length === 0) {
      showToast('No workout to save. Add some exercises first!', 'error');
      return;
    }

    const endTime = new Date();
    const duration = workoutStartTime
      ? Math.round((endTime.getTime() - workoutStartTime.getTime()) / 1000 / 60) // minutes
      : 0;

    const workout: Workout = {
      id: Date.now().toString(),
      date: endTime.toISOString(),
      exercises: selectedExercises,
      name: workoutName || `Workout - ${endTime.toLocaleDateString()}`,
      duration,
    };

    const updatedHistory = [workout, ...workoutHistory];
    setWorkoutHistory(updatedHistory);
    await saveWorkoutHistory(updatedHistory);

    // Clear current workout
    clearWorkout();
    triggerHaptic('success');
    showToast(`Workout saved: ${workout.name}!`, 'success');
  };

  const clearWorkout = () => {
    setSelectedExercises([]);
    setWorkoutStartTime(null);
    stopRestTimer();
    // Clear saved current workout
    AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
  };

  const getExerciseHistory = (exerciseName: string): Exercise[] => {
    const history: Exercise[] = [];
    workoutHistory.forEach(workout => {
      const exercise = workout.exercises.find(ex => ex.name === exerciseName);
      if (exercise && exercise.sets.length > 0) {
        history.push({
          name: exercise.name,
          sets: exercise.sets,
        });
      }
    });
    return history.slice(0, 20); // Return last 20 sessions
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const value: WorkoutContextType = {
    selectedExercises,
    addExercise,
    addSetToExercise,
    removeSetFromExercise,
    editSetInExercise,
    finishWorkout,
    clearWorkout,
    workoutHistory,
    getExerciseHistory,
    isRestTimerActive,
    restTimeRemaining,
    startRestTimer,
    stopRestTimer,
    workoutStartTime,
    settings,
    updateSettings,
    showToast,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
      {/* Toast Component */}
      {toastVisible && (
        <Toast
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />
      )}
    </WorkoutContext.Provider>
  );
};

// Toast Component
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}> = ({ message, type, onDismiss }) => {
  const getToastColor = () => {
    switch (type) {
      case 'success': return '#4CAF50'; // green
      case 'error': return '#f44336'; // red
      default: return '#2196F3'; // blue for info
    }
  };

  return (
    <View style={[toastStyles.container, { backgroundColor: getToastColor() }]}>
      <Text style={toastStyles.text}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} style={toastStyles.closeButton}>
        <Text style={toastStyles.closeText}>{'\u00D7'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Toast;

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
