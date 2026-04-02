import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { RulerPicker } from '@/components/RulerPicker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { kgToLbs, lbsToKg } from '@/utils/units';

export default function CurrentWeightScreen() {
  const { currentWeightKg, setCurrentWeightKg } = useOnboardingStore();
  const weightUnit = useSettingsStore((s) => s.weightUnit);

  const isLbs = weightUnit === 'lbs';
  const displayValue = isLbs
    ? Math.round(kgToLbs(currentWeightKg) * 10) / 10
    : Math.round(currentWeightKg * 10) / 10;

  function handleChange(val: number) {
    setCurrentWeightKg(isLbs ? lbsToKg(val) : val);
  }

  function handleNext() {
    router.push('/onboarding/height');
  }

  return (
    <OnboardingLayout step={4} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6 mb-1">
        What's your current weight?
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mb-10">
        We'll use this to calculate your daily calorie goal.
      </Text>

      <View className="flex-1 justify-center">
        <RulerPicker
          value={displayValue}
          min={isLbs ? 88 : 40}
          max={isLbs ? 440 : 200}
          step={isLbs ? 0.5 : 0.1}
          unit={isLbs ? 'lbs' : 'kg'}
          onChange={handleChange}
        />
      </View>

      <Pressable
        onPress={handleNext}
        className="bg-text-primary dark:bg-text-dark-primary rounded-2xl py-4 items-center mb-6"
      >
        <Text className="text-white dark:text-dark-primary font-bold text-base">
          Next
        </Text>
      </Pressable>
    </OnboardingLayout>
  );
}
