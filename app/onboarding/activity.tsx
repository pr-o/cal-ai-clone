import { Text } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { OptionPills } from '@/components/OptionPills';
import { useOnboardingStore, ActivityLevel } from '@/stores/onboardingStore';

const OPTIONS = [
  { value: 'sedentary' as ActivityLevel, label: 'Sedentary', emoji: '🛋️', sub: 'Little or no exercise' },
  { value: 'light' as ActivityLevel, label: 'Lightly active', emoji: '🚶', sub: 'Exercise 1–3 days/week' },
  { value: 'moderate' as ActivityLevel, label: 'Active', emoji: '🏃', sub: 'Exercise 3–5 days/week' },
  { value: 'active' as ActivityLevel, label: 'Very active', emoji: '⚡', sub: 'Hard exercise 6–7 days/week' },
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
      <OptionPills options={OPTIONS} selected={activityLevel} onSelect={handleSelect} />
    </OnboardingLayout>
  );
}
