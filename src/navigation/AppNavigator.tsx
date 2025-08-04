import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Exercise Library" component={ExerciseLibraryScreen} />
        <Tab.Screen name="Workout Session" component={WorkoutSessionScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
