// src/screens/WorkoutSessionScreen.tsx
import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

export default function WorkoutSessionScreen() {
  const [exercises, setExercises] = useState<string[]>([
    'Bench Press',
    'Squat',
    'Deadlift',
  ]); // placeholder list

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Workout</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item}</Text>
            <Text>- Set 1: 10 reps x 50kg</Text>
            <Text>- Set 2: 8 reps x 55kg</Text>
          </View>
        )}
      />

      <View style={styles.buttonContainer}>
        <Button title="Add Exercise" onPress={() => {}} />
        <Button title="Finish Workout" onPress={() => {}} color="#FF3B30" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  exerciseCard: {
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
