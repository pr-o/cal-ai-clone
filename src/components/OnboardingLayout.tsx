import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  total: number;
  onBack?: () => void;
  showLanguage?: boolean;
}

export function OnboardingLayout({
  children,
  step,
  total,
  onBack,
  showLanguage = false,
}: OnboardingLayoutProps) {
  const progress = step / total;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-primary">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-1">
        <Pressable
          onPress={handleBack}
          className="w-9 h-9 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-secondary"
          hitSlop={8}
        >
          <Text className="text-xl text-text-primary dark:text-text-dark-primary">←</Text>
        </Pressable>

        {/* Progress bar */}
        <View className="flex-1 mx-3 h-1 bg-gray-200 dark:bg-dark-secondary rounded-full">
          <View
            className="h-1 bg-text-primary dark:bg-text-dark-primary rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        {showLanguage ? (
          <View className="flex-row items-center gap-1">
            <Text className="text-sm">🇺🇸</Text>
            <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">EN</Text>
          </View>
        ) : (
          <View className="w-9" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 px-5 pt-4">{children}</View>
    </SafeAreaView>
  );
}
