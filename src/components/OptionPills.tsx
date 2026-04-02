import { Pressable, Text, View } from 'react-native';

export interface Option<T extends string> {
  value: T;
  label: string;
  emoji: string;
  sub?: string;
}

interface OptionPillsProps<T extends string> {
  options: Option<T>[];
  selected: T | null | undefined;
  onSelect: (value: T) => void;
}

export function OptionPills<T extends string>({
  options,
  selected,
  onSelect,
}: OptionPillsProps<T>) {
  return (
    <>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              isSelected
                ? 'border-text-primary dark:border-text-dark-primary bg-bg-secondary dark:bg-dark-secondary'
                : 'border-border dark:border-dark-border bg-white dark:bg-dark-secondary'
            }`}
          >
            <Text className="text-3xl mr-4">{opt.emoji}</Text>
            <View>
              <Text className="font-bold text-text-primary dark:text-text-dark-primary">
                {opt.label}
              </Text>
              {opt.sub && (
                <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                  {opt.sub}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </>
  );
}
