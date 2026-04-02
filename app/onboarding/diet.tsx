import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import {
  useOnboardingStore,
  DietaryPreference,
} from '@/stores/onboardingStore';

const OPTIONS: { value: DietaryPreference; label: string; emoji: string }[] = [
  { value: 'none', label: 'No restrictions', emoji: '🍽️' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'keto', label: 'Keto', emoji: '🥑' },
  { value: 'gluten_free', label: 'Gluten-free', emoji: '🌾' },
];

export default function DietScreen() {
  const { dietaryPreferences, toggleDietaryPreference } = useOnboardingStore();

  function handleNext() {
    router.push('/onboarding/results');
  }

  return (
    <OnboardingLayout step={8} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6">
        Any dietary preferences?
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1 mb-8">
        Select all that apply.
      </Text>

      {OPTIONS.map((opt) => {
        const selected = dietaryPreferences.includes(opt.value);
        return (
          <Pressable
            key={opt.value}
            onPress={() => toggleDietaryPreference(opt.value)}
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              selected
                ? 'border-text-primary dark:border-text-dark-primary bg-bg-secondary dark:bg-dark-secondary'
                : 'border-border dark:border-dark-border bg-white dark:bg-dark-secondary'
            }`}
          >
            <Text className="text-3xl mr-4">{opt.emoji}</Text>
            <Text className="font-bold text-text-primary dark:text-text-dark-primary flex-1">
              {opt.label}
            </Text>
            {selected && (
              <View className="w-6 h-6 rounded-full bg-text-primary dark:bg-text-dark-primary items-center justify-center">
                <Text className="text-white text-xs font-bold">✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}

      <View className="flex-1" />

      <Pressable
        onPress={handleNext}
        disabled={dietaryPreferences.length === 0}
        className={`rounded-2xl py-4 items-center mb-6 ${
          dietaryPreferences.length > 0
            ? 'bg-text-primary dark:bg-text-dark-primary'
            : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <Text className="text-white dark:text-dark-primary font-bold text-base">
          Next
        </Text>
      </Pressable>
    </OnboardingLayout>
  );
}
