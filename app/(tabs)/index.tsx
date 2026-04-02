import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { CalorieRing } from '@/components/CalorieRing';
import { MacroPill } from '@/components/MacroPill';
import { FoodEntryCard } from '@/components/FoodEntryCard';
import { WeekStrip } from '@/components/WeekStrip';
import { useDailyStore } from '@/stores/dailyStore';
import { useProfileStore } from '@/stores/profileStore';
import { calculateStreak } from '@/utils/streaks';
import { getTodayString } from '@/utils/date';

const FAB_OPTIONS = [
  { label: 'Camera', emoji: '📸', route: '/log/camera' as const },
  { label: 'Search', emoji: '🔍', route: '/log/search' as const },
  { label: 'Exercise', emoji: '💪', route: '/log/exercise' as const },
  { label: 'Water', emoji: '💧', route: '/log/water' as const },
];

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [fabOpen, setFabOpen] = useState(false);

  const hydrateForDate = useDailyStore((s) => s.hydrateForDate);
  const deleteEntry = useDailyStore((s) => s.deleteEntry);
  const entries = useDailyStore((s) => s.entries);
  const caloriesConsumed = useDailyStore((s) => s.caloriesConsumed);
  const macrosConsumed = useDailyStore((s) => s.macrosConsumed);

  const dailyCalories = useProfileStore((s) => s.dailyCalories);
  const dailyProteinG = useProfileStore((s) => s.dailyProteinG);
  const dailyCarbsG = useProfileStore((s) => s.dailyCarbsG);
  const dailyFatG = useProfileStore((s) => s.dailyFatG);

  // Re-hydrate whenever the screen comes into focus (e.g. returning from log screens)
  useFocusEffect(
    useCallback(() => {
      hydrateForDate(selectedDate, dailyCalories);
    }, [selectedDate, dailyCalories, hydrateForDate])
  );

  function handleDaySelect(date: string) {
    setSelectedDate(date);
    hydrateForDate(date, dailyCalories);
  }

  const streak = calculateStreak(
    [...new Set(entries.map((e) => e.loggedAt.slice(0, 10)))]
  );

  function handleFabOption(route: string) {
    setFabOpen(false);
    router.push(route as any);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary dark:bg-dark-primary" edges={['top']}>
      {/* Header row: date label + streak */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
        <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-base">🔥</Text>
          <Text className="text-sm font-bold text-text-primary dark:text-text-dark-primary">
            {streak} day{streak !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Week strip */}
      <View className="px-2 mb-2">
        <WeekStrip selectedDate={selectedDate} onDaySelect={handleDaySelect} />
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Calorie ring */}
            <View className="items-center my-4">
              <CalorieRing
                consumed={caloriesConsumed}
                goal={dailyCalories}
                size={200}
              />
            </View>

            {/* Macro pills */}
            <View className="flex-row mb-5">
              <MacroPill
                type="protein"
                remaining={dailyProteinG - macrosConsumed.proteinG}
                goal={dailyProteinG}
              />
              <MacroPill
                type="carbs"
                remaining={dailyCarbsG - macrosConsumed.carbsG}
                goal={dailyCarbsG}
              />
              <MacroPill
                type="fat"
                remaining={dailyFatG - macrosConsumed.fatG}
                goal={dailyFatG}
              />
            </View>

            {/* Section header */}
            <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-3">
              Recently logged
            </Text>
          </>
        }
        ListEmptyComponent={
          <View className="items-center pt-8 pb-4">
            <Text className="text-5xl mb-3">🍽️</Text>
            <Text className="text-sm text-text-secondary dark:text-text-dark-secondary text-center px-8">
              Start tracking today's meals by taking a quick picture
            </Text>
            <Pressable
              onPress={() => router.push('/log/camera' as any)}
              className="mt-4 bg-text-primary dark:bg-text-dark-primary px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold text-sm">Scan Food</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <FoodEntryCard
            id={item.id}
            name={item.name}
            calories={item.calories}
            proteinG={item.proteinG}
            carbsG={item.carbsG}
            fatG={item.fatG}
            photoUri={item.photoUri}
            loggedAt={item.loggedAt}
            onDelete={deleteEntry}
          />
        )}
      />

      {/* FAB */}
      <Pressable
        onPress={() => setFabOpen(true)}
        className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-text-primary dark:bg-text-dark-primary items-center justify-center shadow-lg"
        style={{ elevation: 6 }}
      >
        <Text className="text-white dark:text-dark-primary text-3xl leading-none">+</Text>
      </Pressable>

      {/* FAB bottom sheet */}
      <Modal
        visible={fabOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFabOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setFabOpen(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-secondary rounded-t-3xl pb-10 pt-4 px-4">
            <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-4" />
            <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-3 px-1">
              Log something
            </Text>
            {FAB_OPTIONS.map((opt) => (
              <Pressable
                key={opt.route}
                onPress={() => handleFabOption(opt.route)}
                className="flex-row items-center p-4 rounded-2xl mb-2 bg-bg-secondary dark:bg-dark-primary"
              >
                <Text className="text-2xl mr-4">{opt.emoji}</Text>
                <Text className="font-medium text-text-primary dark:text-text-dark-primary">
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
