import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WorkoutProvider } from './src/context/WorkoutContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WorkoutProvider>
        <AppNavigator />
      </WorkoutProvider>
    </GestureHandlerRootView>
  );
}