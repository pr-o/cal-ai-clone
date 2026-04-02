import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { estimateCaloriesBurned, EXERCISE_SUGGESTIONS } from '@/utils/exercise';
import { useDailyStore } from '@/stores/dailyStore';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function ExerciseScreen() {
  const [exerciseName, setExerciseName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [saving, setSaving] = useState(false);

  const addExerciseEntry = useDailyStore((s) => s.addExerciseEntry);

  // Auto-estimate calories when name or duration changes
  useEffect(() => {
    if (exerciseName.trim() && durationMinutes) {
      const mins = parseInt(durationMinutes, 10);
      if (!isNaN(mins) && mins > 0) {
        const estimate = estimateCaloriesBurned(exerciseName, mins);
        setCaloriesBurned(String(estimate));
      }
    }
  }, [exerciseName, durationMinutes]);

  async function handleLog() {
    const mins = parseInt(durationMinutes, 10);
    const cals = parseInt(caloriesBurned, 10);
    if (!exerciseName.trim() || isNaN(mins) || isNaN(cals)) return;

    setSaving(true);
    try {
      await addExerciseEntry({
        name: exerciseName.trim(),
        durationMinutes: mins,
        caloriesBurned: cals,
      });
      router.replace('/(tabs)/');
    } catch {
      setSaving(false);
    }
  }

  const canSave =
    exerciseName.trim().length > 0 &&
    parseInt(durationMinutes, 10) > 0 &&
    parseInt(caloriesBurned, 10) > 0;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-primary" edges={['top']}>
      <ScreenHeader title="Log Exercise" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise name */}
        <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
          Exercise
        </Text>
        <TextInput
          value={exerciseName}
          onChangeText={setExerciseName}
          placeholder="e.g. Running"
          placeholderTextColor="#9CA3AF"
          className="border border-border dark:border-dark-border rounded-2xl px-4 py-3 text-text-primary dark:text-text-dark-primary mb-4 bg-white dark:bg-dark-secondary"
          returnKeyType="next"
        />

        {/* Suggestions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5 -mx-1"
        >
          {EXERCISE_SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setExerciseName(s)}
              className={`mx-1 px-3 py-1.5 rounded-full border ${
                exerciseName === s
                  ? 'bg-text-primary dark:bg-text-dark-primary border-text-primary dark:border-text-dark-primary'
                  : 'bg-transparent border-border dark:border-dark-border'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  exerciseName === s
                    ? 'text-white dark:text-dark-primary'
                    : 'text-text-secondary dark:text-text-dark-secondary'
                }`}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Duration */}
        <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
          Duration (minutes)
        </Text>
        <TextInput
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="number-pad"
          placeholder="30"
          placeholderTextColor="#9CA3AF"
          className="border border-border dark:border-dark-border rounded-2xl px-4 py-3 text-text-primary dark:text-text-dark-primary mb-4 bg-white dark:bg-dark-secondary"
          returnKeyType="next"
        />

        {/* Calories burned */}
        <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
          Calories burned
        </Text>
        <TextInput
          value={caloriesBurned}
          onChangeText={setCaloriesBurned}
          keyboardType="number-pad"
          placeholder="Auto-estimated"
          placeholderTextColor="#9CA3AF"
          className="border border-border dark:border-dark-border rounded-2xl px-4 py-3 text-text-primary dark:text-text-dark-primary mb-2 bg-white dark:bg-dark-secondary"
          returnKeyType="done"
        />
        <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mb-6">
          Estimated based on exercise type and duration. Tap to edit.
        </Text>

        <Pressable
          onPress={handleLog}
          disabled={!canSave || saving}
          className={`rounded-2xl py-4 items-center ${
            canSave ? 'bg-text-primary dark:bg-text-dark-primary' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Log Exercise 💪</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
