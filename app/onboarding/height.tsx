import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { RulerPicker } from '@/components/RulerPicker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cmToFtIn, ftInToCm } from '@/utils/units';

export default function HeightScreen() {
  const { heightCm, setHeightCm } = useOnboardingStore();
  const weightUnit = useSettingsStore((s) => s.weightUnit);

  const isImperial = weightUnit === 'lbs';

  // Display value in cm or total inches
  const totalInches = isImperial
    ? Math.round((heightCm / 2.54) * 10) / 10
    : null;
  const displayValue = isImperial ? totalInches! : heightCm;

  const { ft, in: inches } = cmToFtIn(heightCm);
  const displayUnit = isImperial ? `ft ${ft}" ${inches}'` : 'cm';

  function handleChange(val: number) {
    setHeightCm(isImperial ? ftInToCm(Math.floor(val / 12), val % 12) : val);
  }

  function handleNext() {
    router.push('/onboarding/target-weight');
  }

  return (
    <OnboardingLayout step={5} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6 mb-1">
        How tall are you?
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mb-10">
        Height helps calculate your metabolic rate.
      </Text>

      <View className="flex-1 justify-center">
        <RulerPicker
          value={displayValue}
          min={isImperial ? 48 : 100} // 4ft or 100cm
          max={isImperial ? 96 : 250} // 8ft or 250cm
          step={isImperial ? 1 : 1}
          unit={displayUnit}
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
