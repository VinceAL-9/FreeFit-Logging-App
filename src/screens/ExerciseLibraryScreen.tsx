// src/screens/ExerciseLibraryScreen.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeProvider';
import { useWorkout } from '../context/WorkoutContext';

const defaultExercises = [
  { name: 'Bench Press', category: 'Chest' },
  { name: 'Squat', category: 'Legs' },
  { name: 'Deadlift', category: 'Back' },
  { name: 'Overhead Press', category: 'Shoulders' },
  { name: 'Barbell Row', category: 'Back' },
  { name: 'Pull-ups', category: 'Back' },
  { name: 'Dips', category: 'Chest' },
  { name: 'Bicep Curls', category: 'Arms' },
  { name: 'Tricep Extensions', category: 'Arms' },
  { name: 'Lateral Raises', category: 'Shoulders' },
  { name: 'Leg Press', category: 'Legs' },
  { name: 'Incline Bench Press', category: 'Chest' },
  { name: 'Romanian Deadlift', category: 'Legs' },
  { name: 'Face Pulls', category: 'Shoulders' },
  { name: 'Leg Curls', category: 'Legs' },
];

const CUSTOM_EXERCISES_KEY = '@custom_exercises';

interface Exercise {
  name: string;
  category: string;
  isCustom?: boolean;
}

export default function ExerciseLibraryScreen() {
  const { addExercise, showToast } = useWorkout();
  const { colors } = useTheme();
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Chest');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  useEffect(() => {
    loadCustomExercises();
  }, []);

  const loadCustomExercises = async () => {
    try {
      const customExercises = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
      if (customExercises) {
        const parsed = JSON.parse(customExercises);
        setExercises([...defaultExercises, ...parsed]);
      }
    } catch (error) {
      console.error('Error loading custom exercises:', error);
    }
  };

  const saveCustomExercises = async (customExercises: Exercise[]) => {
    try {
      await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
    } catch (error) {
      console.error('Error saving custom exercises:', error);
    }
  };

  const handleCreateExercise = () => {
    if (newExerciseName.trim().length === 0) {
      showToast('Please enter an exercise name', 'error');
      return;
    }

    // Check if exercise already exists
    const existingExercise = exercises.find(
      ex => ex.name.toLowerCase() === newExerciseName.trim().toLowerCase()
    );

    if (existingExercise) {
      showToast('An exercise with this name already exists', 'error');
      return;
    }

    const newExercise: Exercise = {
      name: newExerciseName.trim(),
      category: selectedCategory,
      isCustom: true,
    };

    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);

    // Save only custom exercises to storage
    const customExercises = updatedExercises.filter(ex => ex.isCustom);
    saveCustomExercises(customExercises);

    setNewExerciseName('');
    setShowCreateModal(false);
    showToast(`${newExercise.name} has been added to your library!`, 'success');
  };

  const handleDeleteCustomExercise = (exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedExercises = exercises.filter(ex => ex.name !== exerciseName);
            setExercises(updatedExercises);
            
            // Save updated custom exercises
            const customExercises = updatedExercises.filter(ex => ex.isCustom);
            saveCustomExercises(customExercises);
            showToast('Exercise deleted', 'info');
          },
        },
      ]
    );
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedExercises = categories.reduce((acc, category) => {
    acc[category] = filteredExercises.filter(ex => ex.category === category);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const handleAdd = (exercise: Exercise) => {
    addExercise({ name: exercise.name });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Exercise Library</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Search exercises..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Exercise List */}
      <FlatList
        data={categories}
        keyExtractor={category => category}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item: category }) => {
          const categoryExercises = groupedExercises[category];
          if (categoryExercises.length === 0) return null;

          return (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                {category} ({categoryExercises.length})
              </Text>
              {categoryExercises.map((exercise, index) => (
                <View key={exercise.name} style={[styles.exerciseItem, { backgroundColor: colors.surface }]}>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseText, { color: colors.text }]}>{exercise.name}</Text>
                    {exercise.isCustom && (
                      <Text style={[styles.customBadge, { color: colors.info }]}>Custom</Text>
                    )}
                  </View>
                  <View style={styles.exerciseActions}>
                    <Button title="Add" onPress={() => handleAdd(exercise)} />
                    {exercise.isCustom && (
                      <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: colors.error }]}
                        onPress={() => handleDeleteCustomExercise(exercise.name)}
                      >
                        <Text style={styles.deleteButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        }}
      />

      {/* Create Exercise Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Exercise</Text>
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="Exercise name"
              placeholderTextColor={colors.textSecondary}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              autoFocus
            />

            <Text style={[styles.modalLabel, { color: colors.text }]}>Category:</Text>
            <View style={styles.categoryGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: selectedCategory === category ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: selectedCategory === category ? '#fff' : colors.text },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textSecondary }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={handleCreateExercise}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: '500',
  },
  customBadge: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
