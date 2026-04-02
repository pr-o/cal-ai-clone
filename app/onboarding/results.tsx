import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 180;

// Simulated weight-loss curves over 24 weeks
// Cal AI: steady decline, Traditional: slight decline then plateau
function buildPath(points: [number, number][], w: number, h: number): string {
  const xs = points.map(([x]) => (x / 23) * w);
  const ys = points.map(([, y]) => h - ((y - 55) / 20) * h);
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < points.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return d;
}

const CAL_AI_POINTS: [number, number][] = [
  [0, 80], [4, 76], [8, 72], [12, 68], [16, 65], [20, 63], [23, 61],
];

const TRAD_POINTS: [number, number][] = [
  [0, 80], [4, 77], [8, 75], [12, 73], [16, 73], [20, 72], [23, 72],
];

const CAL_AI_PATH = buildPath(CAL_AI_POINTS, CHART_WIDTH, CHART_HEIGHT);
const TRAD_PATH = buildPath(TRAD_POINTS, CHART_WIDTH, CHART_HEIGHT);

export default function ResultsScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <OnboardingLayout step={9} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6 mb-1">
        Cal AI works.
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
        Users who track with AI lose more and keep it off longer.
      </Text>

      {/* Chart */}
      <Animated.View
        style={{ opacity, transform: [{ translateY: slideY }] }}
        className="bg-white dark:bg-dark-secondary rounded-2xl p-4 mb-4"
      >
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Traditional diet line */}
          <Path
            d={TRAD_PATH}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="6,4"
          />
          {/* Cal AI line */}
          <Path
            d={CAL_AI_PATH}
            fill="none"
            stroke="#FF5500"
            strokeWidth={2.5}
          />
          {/* End dot for Cal AI */}
          <Circle
            cx={(23 / 23) * CHART_WIDTH}
            cy={CHART_HEIGHT - ((61 - 55) / 20) * CHART_HEIGHT}
            r={5}
            fill="#FF5500"
          />
        </Svg>
        {/* Legend */}
        <View className="flex-row mt-2 gap-4">
          <View className="flex-row items-center gap-1.5">
            <View className="w-4 h-0.5 bg-accent-orange" />
            <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
              Cal AI
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-4 h-px border-t-2 border-dashed border-gray-400" />
            <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
              Traditional diet
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Stats */}
      <Animated.View
        style={{ opacity, transform: [{ translateY: slideY }] }}
        className="bg-accent-orange/10 rounded-2xl p-4 mb-6"
      >
        <Text className="text-3xl font-black text-accent-orange">80%</Text>
        <Text className="text-sm text-text-primary dark:text-text-dark-primary font-medium mt-1">
          of Cal AI users maintain weight loss 6 months later
        </Text>
      </Animated.View>

      <View className="flex-1" />

      <Pressable
        onPress={() => router.push('/onboarding/plan')}
        className="bg-text-primary dark:bg-text-dark-primary rounded-2xl py-4 items-center mb-6"
      >
        <Text className="text-white dark:text-dark-primary font-bold text-base">
          See my plan
        </Text>
      </Pressable>
    </OnboardingLayout>
  );
}
