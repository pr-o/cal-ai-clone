import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={8} className="mr-3">
        <Text className="text-text-primary dark:text-text-dark-primary text-lg">←</Text>
      </Pressable>
      <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary flex-1">
        {title}
      </Text>
      {rightAction}
    </View>
  );
}
