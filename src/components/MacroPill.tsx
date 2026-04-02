import { Text, View } from 'react-native';

type MacroType = 'protein' | 'carbs' | 'fat';

interface MacroPillProps {
  type: MacroType;
  remaining: number;
  goal: number;
}

const MACRO_CONFIG: Record<MacroType, { label: string; icon: string; color: string; darkColor: string }> = {
  protein: { label: 'Protein left', icon: '🥩', color: '#FF6B35', darkColor: '#FF6B35' },
  carbs: { label: 'Carbs left', icon: '🌾', color: '#FFB800', darkColor: '#FFB800' },
  fat: { label: 'Fat left', icon: '🫙', color: '#4A9EFF', darkColor: '#4A9EFF' },
};

export function MacroPill({ type, remaining, goal }: MacroPillProps) {
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
