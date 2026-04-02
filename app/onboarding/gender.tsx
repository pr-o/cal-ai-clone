import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useOnboardingStore, Gender } from '@/stores/onboardingStore';

const OPTIONS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Male', emoji: '♂️' },
  { value: 'female', label: 'Female', emoji: '♀️' },
  { value: 'other', label: 'Other', emoji: '⚧️' },
];

export default function GenderScreen() {
  const { gender, setGender } = useOnboardingStore();

  function handleSelect(value: Gender) {
    setGender(value);
    router.push('/onboarding/birthday');
  }

  return (
    <OnboardingLayout step={2} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6">
        What's your biological sex?
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1 mb-8">
        Used to calculate your metabolic rate.
      </Text>

      {OPTIONS.map((opt) => {
        const selected = gender === opt.value;
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
            <Text className="font-bold text-text-primary dark:text-text-dark-primary">
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </OnboardingLayout>
  );
}
