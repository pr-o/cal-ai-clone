import { Text } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { OptionPills } from '@/components/OptionPills';
import { useOnboardingStore, Goal } from '@/stores/onboardingStore';

const OPTIONS = [
  { value: 'lose' as Goal, label: 'Lose weight', emoji: '🔥', sub: 'Burn fat, get lean' },
  { value: 'maintain' as Goal, label: 'Maintain weight', emoji: '⚖️', sub: 'Stay where I am' },
  { value: 'gain' as Goal, label: 'Gain muscle', emoji: '💪', sub: 'Build strength & size' },
];

export default function GoalScreen() {
  const { goal, setGoal } = useOnboardingStore();

  function handleSelect(value: Goal) {
    setGoal(value);
    router.push('/onboarding/gender');
  }

  return (
    <OnboardingLayout step={1} total={10} onBack={() => {}}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6">
        What's your goal?
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1 mb-8">
        We'll personalize your plan based on this.
      </Text>
      <OptionPills options={OPTIONS} selected={goal} onSelect={handleSelect} />
    </OnboardingLayout>
  );
}
