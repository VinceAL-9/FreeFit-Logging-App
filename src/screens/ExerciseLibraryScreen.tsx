// src/screens/ExerciseLibraryScreen.tsx
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
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

  const handleAdd = (exercise: { name: string }) => {
    addExercise(exercise);
    Alert.alert('Added', `${exercise.name} added to workout`);
    // You can replace with Toast later if you want
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockExercises}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text style={styles.exerciseText}>{item.name}</Text>
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
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  exerciseText: {
    fontSize: 16,
  },
});
