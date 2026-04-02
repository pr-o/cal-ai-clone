import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { calculateTDEE, MacroTargets } from '@/utils/tdee';
import { db } from '@/db/index';
import { profiles } from '@/db/schema';

type MacroKey = 'calories' | 'proteinG' | 'carbsG' | 'fatG';

const RING_CONFIG: {
  key: MacroKey;
  label: string;
  unit: string;
  color: string;
}[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#FF5500' },
  { key: 'proteinG', label: 'Protein', unit: 'g', color: '#FF6B35' },
  { key: 'carbsG', label: 'Carbs', unit: 'g', color: '#FFB800' },
  { key: 'fatG', label: 'Fat', unit: 'g', color: '#4A9EFF' },
];

function MacroRing({
  value,
  color,
  label,
  unit,
  onEdit,
}: {
  value: number;
  color: string;
  label: string;
  unit: string;
  onEdit: () => void;
}) {
  const size = 120;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  return (
    <View className="items-center w-36">
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E5E5" strokeWidth={8} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={8}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View className="items-center">
          <Text className="text-lg font-black text-text-primary dark:text-text-dark-primary">
            {value}
          </Text>
          <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
            {unit}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center mt-1 gap-1">
        <Text className="text-xs font-medium text-text-primary dark:text-text-dark-primary">
          {label}
        </Text>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text className="text-xs text-text-secondary">✏️</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PlanScreen() {
  const onboarding = useOnboardingStore();
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);

  const [targets, setTargets] = useState<MacroTargets | null>(null);
  const [editKey, setEditKey] = useState<MacroKey | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (
      onboarding.goal &&
      onboarding.gender &&
      onboarding.birthday &&
      onboarding.activityLevel
    ) {
      const result = calculateTDEE({
        goal: onboarding.goal,
        gender: onboarding.gender,
        birthday: onboarding.birthday,
        currentWeightKg: onboarding.currentWeightKg,
        heightCm: onboarding.heightCm,
        activityLevel: onboarding.activityLevel,
      });
      setTargets(result);
    }
  }, [
    onboarding.goal,
    onboarding.gender,
    onboarding.birthday,
    onboarding.currentWeightKg,
    onboarding.heightCm,
    onboarding.activityLevel,
  ]);

  function handleEditStart(key: MacroKey) {
    if (!targets) return;
    setEditKey(key);
    setEditValue(String(targets[key]));
  }

  function handleEditDone() {
    if (!targets || !editKey) return;
    const num = parseInt(editValue, 10);
    if (!isNaN(num) && num > 0) {
      setTargets({ ...targets, [editKey]: num });
    }
    setEditKey(null);
  }

  async function handleStart() {
    if (!targets || !onboarding.goal || !onboarding.gender || !onboarding.birthday || !onboarding.activityLevel) return;
    setSaving(true);
    try {
      await db.insert(profiles).values({
        goal: onboarding.goal,
        gender: onboarding.gender,
        birthday: onboarding.birthday,
        currentWeightKg: onboarding.currentWeightKg,
        targetWeightKg: onboarding.targetWeightKg,
        heightCm: onboarding.heightCm,
        activityLevel: onboarding.activityLevel,
        dietaryPreferences: JSON.stringify(onboarding.dietaryPreferences),
        dailyCalories: targets.calories,
        dailyProteinG: targets.proteinG,
        dailyCarbsG: targets.carbsG,
        dailyFatG: targets.fatG,
        createdAt: new Date().toISOString(),
      });
      setOnboardingComplete(true);
      onboarding.reset();
      router.replace('/(tabs)/');
    } catch (e) {
      console.error('Failed to save profile:', e);
      setSaving(false);
    }
  }

  if (!targets) {
    return (
      <OnboardingLayout step={10} total={10}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout step={10} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6 mb-1">
        Your personalized plan
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
        Tap the pencil to adjust any target.
      </Text>

      {/* 2×2 grid of macro rings */}
      <View className="flex-row flex-wrap justify-center gap-2 mb-4">
        {RING_CONFIG.map(({ key, label, unit, color }) => (
          <MacroRing
            key={key}
            value={targets[key]}
            color={color}
            label={label}
            unit={unit}
            onEdit={() => handleEditStart(key)}
          />
        ))}
      </View>

      {/* Inline edit input */}
      {editKey && (
        <View className="bg-white dark:bg-dark-secondary border-2 border-text-primary dark:border-text-dark-primary rounded-2xl p-3 mb-4 flex-row items-center gap-3">
          <Text className="text-text-secondary dark:text-text-dark-secondary text-sm flex-1">
            {RING_CONFIG.find((c) => c.key === editKey)?.label}
          </Text>
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleEditDone}
            autoFocus
            className="text-text-primary dark:text-text-dark-primary font-bold text-lg w-20 text-right"
          />
          <Pressable onPress={handleEditDone} className="bg-text-primary dark:bg-text-dark-primary rounded-xl px-3 py-1.5">
            <Text className="text-white text-sm font-bold">Done</Text>
          </Pressable>
        </View>
      )}

      <View className="flex-1" />

      <Pressable
        onPress={handleStart}
        disabled={saving}
        className="bg-accent-orange rounded-2xl py-4 items-center mb-6"
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">
            Let's get started! 🚀
          </Text>
        )}
      </Pressable>
    </OnboardingLayout>
  );
}
