import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeProvider';
import type { Workout } from '../context/WorkoutContext';
import { useWorkout } from '../context/WorkoutContext';
import { csvForWorkout, exportCSV } from '../utils/exportUtils';
import { calculateSetVolume, calculateTotalVolumeForSets, convertWeight } from '../utils/weightConversion';

export default function HistoryScreen() {
  const { workoutHistory, showToast, settings } = useWorkout();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const totalSets = (w: Workout) =>
    w.exercises.reduce((t, ex) => t + ex.sets.length, 0);

  // Updated to use unit conversion for consistent volume calculation
  const totalWt = (w: Workout) =>
    w.exercises.reduce((tot, ex) => {
      return tot + calculateTotalVolumeForSets(ex.sets, settings.weightUnit);
    }, 0);

  // Calculate total volume for all workout history
  const getTotalHistoryVolume = () => {
    return workoutHistory.reduce((total, workout) => {
      return total + totalWt(workout);
    }, 0);
  };

  /* exports */
  const exportOne = async (w: Workout) => {
    try {
      const csv = csvForWorkout(w);
      const name = w.name?.replace(/\s+/g, '_').replace(/[^a-z0-9-_]/gi, '');
      const file = `workout_${name}_${Date.now()}.csv`;
      await exportCSV(file, csv);
      showToast(`Exported ${file}`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Export failed', 'error');
    }
  };

  const exportAll = async () => {
    if (!workoutHistory.length) {
      showToast('No workouts to export', 'info');
      return;
    }
    try {
      const csv = workoutHistory
        .map(csvForWorkout)
        .join('\n\n');
      const file = `all_workouts_${Date.now()}.csv`;
      await exportCSV(file, csv);
      showToast(`Exported ${file}`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Export failed', 'error');
    }
  };

  /* render one card */
  const Card = ({ item }: { item: Workout }) => {
    const expanded = selected === item.id;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => setSelected(expanded ? null : item.id)}
        onLongPress={() =>
          Alert.alert('Workout', 'Export this workout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Export', onPress: () => exportOne(item) },
          ])
        }
      >
        {/* header row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.workoutName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.workoutDate, { color: colors.textSecondary }]}>
              {fmtDate(item.date)} {fmtTime(item.date)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.statText, { color: colors.primary }]}>
              {totalSets(item)} sets
            </Text>
            {item.duration ? (
              <Text style={[styles.statText, { color: colors.primary }]}>
                {item.duration}m
              </Text>
            ) : null}
          </View>
        </View>

        {/* short list of exercises */}
        <View style={styles.exerciseRow}>
          {item.exercises.map((ex, i) => (
            <Text key={i} style={[styles.exerciseText, { color: colors.text }]}>
              {ex.name} ({ex.sets.length})
            </Text>
          ))}
        </View>

        {/* expanded details */}
        {expanded && (
          <View style={[styles.detailsBox, { borderTopColor: colors.border }]}>
            {item.exercises.map((ex, exIdx) => (
              <View key={exIdx} style={styles.detailSection}>
                <Text style={[styles.detailHeader, { color: colors.text }]}>
                  {ex.name}
                </Text>
                {ex.sets.map((s, i) => {
                  // Convert weight to user's preferred unit for display
                  const convertedWeight = convertWeight(s.weight, s.unit, settings.weightUnit);
                  const setVolume = calculateSetVolume(s.reps, s.weight, s.unit, settings.weightUnit);
                  
                  return (
                    <Text
                      key={i}
                      style={[styles.setLine, { color: colors.textSecondary }]}
                    >
                      Set {i + 1}: {s.reps} × {convertedWeight.toFixed(1)}{settings.weightUnit}
                      {s.unit !== settings.weightUnit && (
                        <Text style={{ fontSize: 10, opacity: 0.7 }}>
                          {' '}(orig: {s.weight}{s.unit})
                        </Text>
                      )}
                      {' '}Vol: {setVolume.toFixed(1)}{settings.weightUnit}
                    </Text>
                  );
                })}
              </View>
            ))}

            <View style={[styles.summaryBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.summaryText, { color: colors.text }]}>
                Total Volume: {totalWt(item).toFixed(1)}{settings.weightUnit}
              </Text>
              <Text style={[styles.summaryText, { color: colors.text }]}>
                Total Sets: {totalSets(item)}
              </Text>
              {item.duration ? (
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  Duration: {item.duration} min
                </Text>
              ) : null}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /* empty list */
  if (!workoutHistory.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Workout History
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Complete your first workout to see it here.
          </Text>
        </View>
      </View>
    );
  }

  /* main list */
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.topTitle, { color: colors.text }]}>Workout History</Text>
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            Alert.alert('Export', 'Choose export option', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'All Workouts', onPress: exportAll },
            ])
          }
        >
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* stat bar */}
      <View style={[styles.statBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {workoutHistory.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Workouts
          </Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {workoutHistory.reduce((t, w) => t + totalSets(w), 0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Sets
          </Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {getTotalHistoryVolume().toFixed(0)}{settings.weightUnit}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Volume
          </Text>
        </View>
      </View>

      <FlatList
        data={workoutHistory}
        keyExtractor={(w) => w.id}
        renderItem={Card}
        contentContainerStyle={styles.listWrap}
      />
    </View>
  );
}

/* ---- styles ---- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  topTitle: { fontSize: 24, fontWeight: 'bold' },
  exportBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  exportText: { color: '#fff', fontWeight: '600' },
  statBar: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  statCol: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12 },
  listWrap: { padding: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  workoutName: { fontSize: 18, fontWeight: 'bold' },
  workoutDate: { fontSize: 14 },
  statText: { fontSize: 12, fontWeight: '600' },
  exerciseRow: { marginTop: 8 },
  exerciseText: { fontSize: 14, marginBottom: 2 },
  detailsBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  detailSection: { marginBottom: 8 },
  detailHeader: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  setLine: { fontSize: 13, marginLeft: 8 },
  summaryBox: { marginTop: 8, padding: 8, borderRadius: 8 },
  summaryText: { fontSize: 13 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
