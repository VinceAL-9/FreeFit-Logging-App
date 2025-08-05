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
  const { selectedExercises, addSetToExercise, removeSetFromExercise, editSetInExercise } = useWorkout();
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<{
    exerciseName: string;
    setIndex: number;
  } | null>(null);
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');


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
                      text: 'Edit',
                      onPress: () => {
                        setEditMode({ exerciseName: item.name, setIndex: index });
                        setEditReps(set.reps.toString());
                        setEditWeight(set.weight.toString());
                      },
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

          {editMode &&
            editMode.exerciseName === item.name &&
            (() => {

              const isEditingThisExercise = item.name === editMode.exerciseName;
              return (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Editing Set {editMode.setIndex + 1}</Text>
                  <TextInput
                    placeholder="New Reps"
                    value={editReps}
                    onChangeText={setEditReps}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="New Weight (kg)"
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <Button
                    title="Save Changes"
                    onPress={() => {
                      const newReps = parseInt(editReps, 10);
                      const newWeight = parseFloat(editWeight);

                      if (!isNaN(newReps) && !isNaN(newWeight)) {
                        if (newReps <= 0 || newWeight < 0) {
                          Alert.alert('Invalid input', 'Reps must be greater than 0 and weight cannot be negative.');
                          return;
                        }
                        editSetInExercise(item.name, editMode.setIndex, newReps, newWeight);
                        setEditMode(null);
                        setEditReps('');
                        setEditWeight('');
                      }
                    }}
                  />
                  <Button title="Cancel Edit" color="gray" onPress={() => setEditMode(null)} />
                </View>
              );
            })()}


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
              {!editMode && (
                <Button
                  title="Add Set"
                  onPress={() => handleAddSet(item.name)}
                />
              )}
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
