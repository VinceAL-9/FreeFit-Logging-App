import React, { createContext, ReactNode, useContext, useState } from 'react';

type Exercise = {
  name: string;
  sets: {
    reps: number;
    weight: number;
  }[];
};


type WorkoutContextType = {
  selectedExercises: Exercise[];
  addExercise: (exercise: { name: string }) => void;
  removeExercise: (exerciseName: string) => void;
  addSetToExercise: (exerciseName: string, reps: number, weight: number) => void;
};


const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  const addExercise = (exercise: { name: string }) => {
  setSelectedExercises((prev) => [
    ...prev,
    { ...exercise, sets: [] },
  ]);
};

const addSetToExercise = (exerciseName: string, reps: number, weight: number) => {
  setSelectedExercises((prev) =>
    prev.map((exercise) =>
      exercise.name === exerciseName
        ? {
            ...exercise,
            sets: [...exercise.sets, { reps, weight }],
          }
        : exercise
    )
  );
};

  const removeExercise = (exerciseName: string) => {
    setSelectedExercises((prev) =>
      prev.filter((e) => e.name !== exerciseName)
    );
  };

  return (
    <WorkoutContext.Provider value={{
  selectedExercises,
  addExercise,
  removeExercise,
  addSetToExercise,
}}>
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
