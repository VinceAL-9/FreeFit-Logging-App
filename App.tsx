// App.tsx
import * as Font from "expo-font";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './src/context/ThemeProvider';
import { WorkoutProvider } from './src/context/WorkoutContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      "Roboto-Regular": require("./assets/fonts/roboto/Roboto-Regular.ttf"),
      // ...more fonts
      "strokeWeight-80-rotate-12": require("./assets/fonts/strokeweight/strokeWeight-80-rotate-12.otf"),
      "strokeWeight-120-rotate-6": require("./assets/fonts/strokeweight/strokeWeight-120-rotate-6.otf"),
    }).then(() => setFontsLoaded(true));
  }, []);
  if (!fontsLoaded) return null;
  
  
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <WorkoutProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </WorkoutProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}