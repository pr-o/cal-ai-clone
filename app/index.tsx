import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/stores/settingsStore';

export default function Index() {
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  return (
    <Redirect href={onboardingComplete ? '/(tabs)/' : '/onboarding/goal'} />
  );
}
