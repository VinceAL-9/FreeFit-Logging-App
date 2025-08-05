// App.tsx

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider } from './src/context/ThemeProvider';
import { WorkoutProvider } from './src/context/WorkoutContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <WorkoutProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </WorkoutProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}