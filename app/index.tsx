import { Redirect } from 'expo-router';

export default function Index() {
  // Router gate: will be replaced in Phase 4 with MMKV onboarding check
  return <Redirect href="/onboarding/goal" />;
}
