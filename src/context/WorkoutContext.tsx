import React, { createContext, ReactNode, useContext, useState } from 'react';

type Exercise = {
  name: string;
};

type WorkoutContextType = {
  selectedExercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseName: string) => void;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  const addExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => [...prev, exercise]);
  };

  const removeExercise = (exerciseName: string) => {
    setSelectedExercises((prev) =>
      prev.filter((e) => e.name !== exerciseName)
    );
  };

  return (
    <WorkoutContext.Provider value={{ selectedExercises, addExercise, removeExercise }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
