import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDailyStore } from '@/stores/dailyStore';
import { ScreenHeader } from '@/components/ScreenHeader';

const WATER_GOAL_ML = 2500;
const QUICK_OPTIONS = [250, 500, 750, 1000];

export default function WaterScreen() {
  const waterMl = useDailyStore((s) => s.waterMl);
  const updateWater = useDailyStore((s) => s.updateWater);

  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd(ml: number) {
    if (ml <= 0) return;
    setSaving(true);
    try {
      await updateWater(ml);
      router.replace('/(tabs)/');
    } catch {
      setSaving(false);
    }
  }

  function handleCustomAdd() {
    const ml = parseInt(custom, 10);
    if (!isNaN(ml) && ml > 0) handleAdd(ml);
  }

  const progress = Math.min(waterMl / WATER_GOAL_ML, 1);
  const remaining = Math.max(0, WATER_GOAL_ML - waterMl);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-primary" edges={['top']}>
      <ScreenHeader title="Log Water" />

      <View className="flex-1 px-5 pt-6">
        {/* Today's progress */}
        <View className="items-center mb-6">
          <Text className="text-5xl font-black text-blue-500 mb-1">
            {waterMl}
            <Text className="text-xl font-medium text-text-secondary dark:text-text-dark-secondary">
              {' '}ml
            </Text>
          </Text>
          <Text className="text-sm text-text-secondary dark:text-text-dark-secondary">
            today · {remaining} ml remaining
          </Text>

          {/* Progress bar */}
          <View className="w-full h-3 bg-bg-secondary dark:bg-dark-secondary rounded-full mt-4 overflow-hidden">
            <View
              className="h-3 bg-blue-400 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
            Daily goal: {WATER_GOAL_ML} ml
          </Text>
        </View>

        {/* Quick add buttons */}
        <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-3">
          Quick add
        </Text>
        <View className="flex-row gap-2 mb-6">
          {QUICK_OPTIONS.map((ml) => (
            <Pressable
              key={ml}
              onPress={() => handleAdd(ml)}
              disabled={saving}
              className="flex-1 bg-blue-50 dark:bg-dark-secondary rounded-2xl py-4 items-center"
            >
              <Text className="text-lg">💧</Text>
              <Text className="text-sm font-bold text-blue-500 mt-1">
                {ml} ml
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom amount */}
        <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
          Custom amount (ml)
        </Text>
        <View className="flex-row gap-3">
          <TextInput
            value={custom}
            onChangeText={setCustom}
            keyboardType="number-pad"
            placeholder="e.g. 350"
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            onSubmitEditing={handleCustomAdd}
            className="flex-1 border border-border dark:border-dark-border rounded-2xl px-4 py-3 text-text-primary dark:text-text-dark-primary bg-white dark:bg-dark-secondary"
          />
          <Pressable
            onPress={handleCustomAdd}
            disabled={saving || !custom}
            className={`rounded-2xl px-5 items-center justify-center ${
              custom ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold">Add</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
