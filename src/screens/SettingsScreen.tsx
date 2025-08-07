// src/screens/SettingsScreen.tsx

import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemeMode, useTheme } from '../context/ThemeProvider';
import { useWorkout } from '../context/WorkoutContext';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useWorkout();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    updateSettings({ theme: mode });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const restTimerOptions = [60, 90, 120, 180, 240, 300]; // 1, 1.5, 2, 3, 4, 5 minutes
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Theme Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            <View style={styles.themeButtons}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: themeMode === mode ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleThemeChange(mode)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      {
                        color: themeMode === mode ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Workout Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Rest Timer</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Default rest time between sets
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {formatTime(settings.restTimerDuration)}
            </Text>
          </View>

          <View style={styles.restTimerOptions}>
            {restTimerOptions.map((duration) => (
            <TouchableOpacity
              key={duration} // ✅ Ensure unique keys
              style={[styles.restTimerOption, {
                backgroundColor: settings.restTimerDuration === duration 
                  ? colors.primary : colors.border,
              }]}
              onPress={() => updateSettings({ restTimerDuration: duration })}
            >
              <Text style={[styles.restTimerOptionText, {
                color: settings.restTimerDuration === duration 
                  ? '#fff' : colors.text,
              }]}>
                {formatTime(duration)}
              </Text>
            </TouchableOpacity>
          ))}


            
          </View>
        </View>

        {/* Feedback Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Feedback</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Haptic Feedback</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Vibration feedback for actions
              </Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.hapticsEnabled ? '#fff' : colors.textSecondary}
            />
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Audio feedback for rest timer
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.soundEnabled ? '#fff' : colors.textSecondary}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => Alert.alert(
              'Workout Tracker v1.0',
              'A minimalist workout logging app designed for serious lifters.\\n\\nFeatures:\\n• Offline-first data storage\\n• Exercise history tracking\\n• Customizable rest timers\\n• Dark mode support\\n• CSV data export',
              [{ text: 'OK' }]
            )}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  restTimerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  restTimerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  restTimerOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SettingsScreen;