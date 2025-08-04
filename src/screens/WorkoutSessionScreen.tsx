// src/screens/WorkoutSessionScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useWorkout } from '../context/WorkoutContext';


export default function WorkoutSessionScreen() {
  const { selectedExercises, addSetToExercise, removeSetFromExercise } = useWorkout();
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const handleAddSet = (exerciseName: string) => {
    const reps = parseInt(repsInput, 10);
    const weight = parseFloat(weightInput);

    if (!isNaN(reps) && !isNaN(weight)) {
      addSetToExercise(exerciseName, reps, weight);
      setRepsInput('');
      setWeightInput('');
    }
  };

  return (
    <FlatList
      data={selectedExercises}
      keyExtractor={(item) => item.name}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.exerciseName}>{item.name}</Text>

          {item.sets.map((set, index) => (
            <Pressable
              key={index}
              onLongPress={() => {
                Alert.alert(
                  `Set ${index + 1}`,
                  `${set.reps} reps @ ${set.weight}kg`,
                  [
                    {
                      text: 'Edit (Coming Soon)',
                      onPress: () => {}, // placeholder
                    },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => removeSetFromExercise(item.name, index),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
              >
              <Text>
                Set {index + 1}: {set.reps} reps @ {set.weight}kg
              </Text>
              <Text style={{ fontSize: 12, color: 'gray', marginTop: 4 }}>
                (Long press a set to delete or edit)
              </Text>
            </Pressable>
            
          ))}

          {activeExercise === item.name && (
            <>
              <TextInput
                placeholder="Reps"
                value={repsInput}
                onChangeText={setRepsInput}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                placeholder="Weight (kg)"
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="numeric"
                style={styles.input}
              />
              <Button
                title="Add Set"
                onPress={() => handleAddSet(item.name)}
              />
            </>
          )}

          <Button
            title={
              activeExercise === item.name
                ? 'Cancel'
                : 'Add Set'
            }
            onPress={() =>
              setActiveExercise(
                activeExercise === item.name ? null : item.name
              )
            }
          />
        </View>
        
      )} 
    />
    
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
});
