// src/context/WorkoutContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Vibration } from 'react-native';

export interface Set {
  reps: number;
  weight: number;
  timestamp: string;
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

interface WorkoutContextType {
  selectedExercises: Exercise[];
  addExercise: (exercise: { name: string }) => void;
  addSetToExercise: (exerciseName: string, reps: number, weight: number) => void;
  removeSetFromExercise: (exerciseName: string, setIndex: number) => void;
  editSetInExercise: (exerciseName: string, setIndex: number, reps: number, weight: number) => void;
  finishWorkout: (workoutName?: string) => Promise<void>;
  clearWorkout: () => void;
  workoutHistory: Workout[];
  getExerciseHistory: (exerciseName: string) => Exercise[];
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  workoutStartTime: Date | null;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORKOUT_HISTORY: '@workout_history',
  CURRENT_WORKOUT: '@current_workout',
  REST_TIMER_DURATION: '@rest_timer_duration',
};

const DEFAULT_REST_TIME = 180; // 3 minutes in seconds

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadWorkoutHistory();
    loadCurrentWorkout();
  }, []);

  // Auto-save current workout when it changes
  useEffect(() => {
    saveCurrentWorkout();
  }, [selectedExercises]);

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

  const addExercise = (exercise: { name: string }) => {
    const existingExercise = selectedExercises.find(ex => ex.name === exercise.name);
    if (existingExercise) {
      Alert.alert('Exercise already added', `${exercise.name} is already in your workout.`);
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

    // Haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Fallback to vibration
      Vibration.vibrate(50);
    }
  };

  const addSetToExercise = (exerciseName: string, reps: number, weight: number) => {
    const newSet: Set = {
      reps,
      weight,
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

    // Haptic feedback for successful set log
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      Vibration.vibrate(100);
    }
  };

  const removeSetFromExercise = (exerciseName: string, setIndex: number) => {
    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.name === exerciseName
          ? { ...exercise, sets: exercise.sets.filter((_, index) => index !== setIndex) }
          : exercise
      )
    );

    // Haptic feedback for deletion
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      Vibration.vibrate([50, 50, 50]);
    }
  };

  const editSetInExercise = (exerciseName: string, setIndex: number, reps: number, weight: number) => {
    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.name === exerciseName
          ? {
              ...exercise,
              sets: exercise.sets.map((set, index) =>
                index === setIndex
                  ? { ...set, reps, weight, timestamp: new Date().toISOString() }
                  : set
              ),
            }
          : exercise
      )
    );

    // Light haptic feedback for edit
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Vibration.vibrate(30);
    }
  };

  const startRestTimer = (seconds: number = DEFAULT_REST_TIME) => {
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
          
          // Rest timer completion haptic feedback
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            Vibration.vibrate([100, 50, 100]);
          }
          
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
      Alert.alert('No workout to save', 'Add some exercises and sets before finishing your workout.');
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

    // Success haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Vibration.vibrate([200, 100, 200]);
    }

    Alert.alert(
      'Workout Saved!',
      `Great job! Your workout "${workout.name}" has been saved.${duration > 0 ? ` Duration: ${duration} minutes.` : ''}`,
      [{ text: 'OK' }]
    );
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

    return history.slice(0, 5); // Return last 5 sessions
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
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
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};