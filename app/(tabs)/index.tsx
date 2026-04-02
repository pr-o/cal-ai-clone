import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-primary dark:bg-dark-primary items-center justify-center">
      <Text className="text-text-primary dark:text-text-dark-primary font-bold text-lg">
        Home — Phase 6
      </Text>
    </SafeAreaView>
  );
}
