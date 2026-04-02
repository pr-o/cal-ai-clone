import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useColorScheme } from 'nativewind';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

export function CalorieRing({ consumed, goal, size = 180 }: CalorieRingProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const remaining = Math.max(0, goal - consumed);
  const targetProgress = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  useEffect(() => {
    progress.value = withTiming(targetProgress, { duration: 800 });
  }, [targetProgress, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? '#404040' : '#E5E5E5'}
          strokeWidth={12}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={consumed > goal ? '#FF6B35' : isDark ? '#FFFFFF' : '#000000'}
          strokeWidth={12}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View className="items-center">
        <Text className="text-4xl font-black text-text-primary dark:text-text-dark-primary">
          {remaining.toLocaleString()}
        </Text>
        <Text className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary mt-0.5">
          Calories left
        </Text>
        <Text className="text-lg mt-0.5">🔥</Text>
      </View>
    </View>
  );
}
