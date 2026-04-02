import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useOnboardingStore, Goal } from '@/stores/onboardingStore';

const OPTIONS: { value: Goal; label: string; emoji: string; sub: string }[] = [
  { value: 'lose', label: 'Lose weight', emoji: '🔥', sub: 'Burn fat, get lean' },
  { value: 'maintain', label: 'Maintain weight', emoji: '⚖️', sub: 'Stay where I am' },
  { value: 'gain', label: 'Gain muscle', emoji: '💪', sub: 'Build strength & size' },
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

      {OPTIONS.map((opt) => {
        const selected = goal === opt.value;
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
