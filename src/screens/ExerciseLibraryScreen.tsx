// src/screens/ExerciseLibraryScreen.tsx

import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeProvider';
import { useWorkout } from '../context/WorkoutContext';

const mockExercises = [
  { name: 'Bench Press' },
  { name: 'Squat' },
  { name: 'Deadlift' },
  { name: 'Overhead Press' },
  { name: 'Barbell Row' },
];

export default function ExerciseLibraryScreen() {
  const { addExercise } = useWorkout();
  const { colors } = useTheme();

  const handleAdd = (exercise: { name: string }) => {
    addExercise(exercise); // This already shows toast in WorkoutContext
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={mockExercises}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <View style={[styles.exerciseItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.exerciseText, { color: colors.text }]}>{item.name}</Text>
            <Button title="Add" onPress={() => handleAdd(item)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  exerciseText: {
    fontSize: 16,
  },
});
