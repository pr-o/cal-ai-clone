import { Text } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { OptionPills } from '@/components/OptionPills';
import { useOnboardingStore, Gender } from '@/stores/onboardingStore';

const OPTIONS = [
  { value: 'male' as Gender, label: 'Male', emoji: '♂️' },
  { value: 'female' as Gender, label: 'Female', emoji: '♀️' },
  { value: 'other' as Gender, label: 'Other', emoji: '⚧️' },
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
      <OptionPills options={OPTIONS} selected={gender} onSelect={handleSelect} />
    </OnboardingLayout>
  );
}
