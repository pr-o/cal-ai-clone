import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useOnboardingStore, ActivityLevel } from '@/stores/onboardingStore';

const OPTIONS: {
  value: ActivityLevel;
  label: string;
  emoji: string;
  sub: string;
}[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    emoji: '🛋️',
    sub: 'Little or no exercise',
  },
  {
    value: 'light',
    label: 'Lightly active',
    emoji: '🚶',
    sub: 'Exercise 1–3 days/week',
  },
  {
    value: 'moderate',
    label: 'Active',
    emoji: '🏃',
    sub: 'Exercise 3–5 days/week',
  },
  {
    value: 'active',
    label: 'Very active',
    emoji: '⚡',
    sub: 'Hard exercise 6–7 days/week',
  },
];

export default function ActivityScreen() {
  const { activityLevel, setActivityLevel } = useOnboardingStore();

  function handleSelect(value: ActivityLevel) {
    setActivityLevel(value);
    router.push('/onboarding/diet');
  }

  return (
    <OnboardingLayout step={7} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6">
        How active are you?
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1 mb-8">
        Pick the option that best describes your weekly routine.
      </Text>

      {OPTIONS.map((opt) => {
        const selected = activityLevel === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => handleSelect(opt.value)}
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              selected
                ? 'border-text-primary dark:border-text-dark-primary bg-bg-secondary dark:bg-dark-secondary'
                : 'border-border dark:border-dark-border bg-white dark:bg-dark-secondary'
            }`}
          >
            <Text className="text-3xl mr-4">{opt.emoji}</Text>
            <View>
              <Text className="font-bold text-text-primary dark:text-text-dark-primary">
                {opt.label}
              </Text>
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                {opt.sub}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </OnboardingLayout>
  );
}
