// src/screens/WorkoutSessionScreen.tsx
import React, { useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { useWorkout } from '../context/WorkoutContext';

export default function WorkoutSessionScreen() {
  const { selectedExercises, addExercise } = useWorkout();
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const { addSetToExercise } = useWorkout();

  const handleAddSet = (exerciseName: string) => {
    const repsNum = parseInt(reps, 10);
    const weightNum = parseFloat(weight);

    if (!isNaN(repsNum) && !isNaN(weightNum)) {
      addSetToExercise(exerciseName, repsNum, weightNum);
      setReps('');
      setWeight('');
    }
  };


  return (
    <FlatList
      data={selectedExercises}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 20, padding: 10, borderWidth: 1 }}>
          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>

          {item.sets.map((set, index) => (
            <Text key={index}>
              Set {index + 1}: {set.reps} reps @ {set.weight}kg
            </Text>
          ))}

          <TextInput
            placeholder="Reps"
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            style={{ borderBottomWidth: 1 }}
          />
          <TextInput
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={{ borderBottomWidth: 1, marginBottom: 5 }}
          />
          <Button
            title="Add Set"
            onPress={() => handleAddSet(item.name)}
          />
        </View>
      )}
    />
  );
}
