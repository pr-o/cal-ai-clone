import { Text, View } from 'react-native';
import { type MacroType, MACRO_CONFIG } from '@/constants/macros';

interface MacroPillProps {
  type: MacroType;
  remaining: number;
  goal: number;
}

export function MacroPill({ type, remaining }: MacroPillProps) {
  const config = MACRO_CONFIG[type];
  const isOver = remaining < 0;

  return (
    <View className="flex-1 items-center bg-bg-secondary dark:bg-dark-secondary rounded-2xl py-3 px-2 mx-1">
      <Text className="text-xl font-black text-text-primary dark:text-text-dark-primary">
        {Math.abs(remaining)}g
      </Text>
      <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5 text-center">
        {isOver ? `${type} over` : config.label}
      </Text>
      <Text className="text-base mt-1">{config.icon}</Text>
    </View>
  );
}
