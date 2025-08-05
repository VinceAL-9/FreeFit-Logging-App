// src/navigation/AppNavigator.tsx

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';

import { useTheme } from '../context/ThemeProvider';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { isDark, colors } = useTheme();

  // Create custom navigation theme based on our theme
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            type IconName =
              | 'home-outline'
              | 'barbell-outline'
              | 'time-outline'
              | 'book-outline'
              | 'settings-outline';
            let iconName: IconName = 'home-outline';

            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Workout') {
              iconName = 'barbell-outline';
            } else if (route.name === 'History') {
              iconName = 'time-outline';
            } else if (route.name === 'Library') {
              iconName = 'book-outline';
            } else if (route.name === 'Settings') {
              iconName = 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutSessionScreen} />
        <Tab.Screen name="Library" component={ExerciseLibraryScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}