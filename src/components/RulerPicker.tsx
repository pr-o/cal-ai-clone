import { useCallback, useRef } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TICK_WIDTH = 10; // px per tick
const TICK_GAP = 10; // px between ticks

interface RulerPickerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function RulerPicker({ value, min, max, step = 1, unit = '', onChange }: RulerPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const totalTicks = Math.round((max - min) / step);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const tickIndex = Math.round(offsetX / (TICK_WIDTH + TICK_GAP));
      const newValue = Math.round((min + tickIndex * step) * 10) / 10;
      if (newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    },
    [min, max, step, onChange]
  );

  const initialOffset = ((value - min) / step) * (TICK_WIDTH + TICK_GAP);
  const sidepadding = SCREEN_WIDTH / 2 - TICK_WIDTH / 2;

  return (
    <View className="items-center">
      {/* Value display */}
      <Text className="text-5xl font-black text-text-primary dark:text-text-dark-primary mb-1">
        {value}
        <Text className="text-xl font-medium text-text-secondary dark:text-text-dark-secondary">
          {' '}{unit}
        </Text>
      </Text>

      {/* Ruler */}
      <View className="h-16 w-full overflow-hidden">
        {/* Center indicator */}
        <View className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-text-primary dark:bg-text-dark-primary z-10" />

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK_WIDTH + TICK_GAP}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          contentOffset={{ x: initialOffset, y: 0 }}
          contentContainerStyle={{ paddingHorizontal: sidepadding }}
        >
          {Array.from({ length: totalTicks + 1 }, (_, i) => {
            const tickValue = min + i * step;
            const isMajor = Math.round(tickValue * 10) % (step * 5 * 10) === 0;
            return (
              <View
                key={i}
                className="items-center justify-end pb-1"
                style={{ width: TICK_WIDTH, marginRight: TICK_GAP }}
              >
                <View
                  className="bg-gray-400 dark:bg-gray-400 w-px"
                  style={{ height: isMajor ? 28 : 16 }}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
