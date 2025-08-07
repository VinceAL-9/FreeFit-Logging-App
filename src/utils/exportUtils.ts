import * as FS from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Workout } from '../context/WorkoutContext';

export const csvForWorkout = (w: Workout) => {
  const lines: string[] = [];
  lines.push('# WORKOUT EXPORT', `Workout Name,"${w.name}"`, '');
  lines.push('Exercise,Set,Reps,Weight,Unit,Vol,Timestamp');
  w.exercises.forEach(ex =>
    ex.sets.forEach((s, i) =>
      lines.push(
        `"${ex.name}",${i + 1},${s.reps},${s.weight},${s.unit},${(
          s.reps * s.weight
        ).toFixed(1)},${new Date(s.timestamp).toLocaleString()}`,
      ),
    ),
  );
  return lines.join('\n');
};

export const exportCSV = async (filename: string, content: string) => {
  const uri = FS.documentDirectory + filename;
  await FS.writeAsStringAsync(uri, content, {
    encoding: FS.EncodingType.UTF8,
  });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
  return uri;
};
