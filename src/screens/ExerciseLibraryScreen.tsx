// src/screens/ExerciseLibraryScreen.tsx
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExerciseLibraryScreen() {
  const exerciseList = [
    'Bench Press',
    'Squat',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
    'Pull-Up',
    'Bicep Curl',
    'Tricep Extension',
  ]; // placeholder

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Library</Text>

      <FlatList
        data={exerciseList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exerciseCard} onPress={() => {}}>
            <Text style={styles.exerciseName}>{item}</Text>
          </TouchableOpacity>
        )}
      />
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 20,
  },
});
