// src/screens/HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Workout Tracker</Text>

      <Button
        title="Start Workout"
        onPress={() => navigation.navigate('Workout' as never)}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent History</Text>
        <Text>Last Workout: Chest & Triceps - 3 days ago</Text>
        <Text>Last Workout: Legs - 5 days ago</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise Library</Text>
        <Text>• Bench Press</Text>
        <Text>• Squat</Text>
        <Text>• Deadlift</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginTop: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
});
