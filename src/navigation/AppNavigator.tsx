// src/navigation/AppNavigator.tsx
import { Ionicons } from '@expo/vector-icons'; // or react-native-vector-icons/Ionicons
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            type IconName = 
              | 'home-outline'
              | 'barbell-outline'
              | 'time-outline'
              | 'book-outline'
  
            
            let iconName: IconName = "home-outline";

            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Workout') {
              iconName = 'barbell-outline';
            } else if (route.name === 'History') {
              iconName = 'time-outline';
            } else if (route.name === 'Library') {
              iconName = 'book-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutSessionScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Library" component={ExerciseLibraryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
