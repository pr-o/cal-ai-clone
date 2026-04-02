import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { gte } from 'drizzle-orm';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { type stackDataItem, type lineDataItem } from 'gifted-charts-core';
import { db } from '@/db/index';
import { weightLogs, foodEntries, dailyLogs } from '@/db/schema';
import { useProfileStore } from '@/stores/profileStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { calculateStreak } from '@/utils/streaks';
import { kgToLbs } from '@/utils/units';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48;

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeightPoint {
  date: string;
  weightKg: number;
}

interface DayMacros {
  date: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#4A9EFF' };
  if (bmi < 25) return { label: 'Normal', color: '#22C55E' };
  if (bmi < 30) return { label: 'Overweight', color: '#FFB800' };
  return { label: 'Obese', color: '#FF6B35' };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const profile = useProfileStore((s) => s.profile);
  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const isLbs = weightUnit === 'lbs';

  const [weightData, setWeightData] = useState<WeightPoint[]>([]);
  const [macroData, setMacroData] = useState<DayMacros[]>([]);
  const [streakDates, setStreakDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [logWeightModal, setLogWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    setLoading(true);
    try {
      // Weight logs — last 90 days
      const ninetyDaysAgo = nDaysAgo(90);
      const weights = await db
        .select()
        .from(weightLogs)
        .where(gte(weightLogs.date, ninetyDaysAgo))
        .orderBy(weightLogs.date);
      setWeightData(weights.map((w) => ({ date: w.date, weightKg: w.weightKg })));

      // Food entries — last 7 days, grouped by date
      const sevenDaysAgo = nDaysAgo(7);
      const recentLogs = await db
        .select()
        .from(dailyLogs)
        .where(gte(dailyLogs.date, sevenDaysAgo));

      const recentFoods = await db
        .select()
        .from(foodEntries)
        .where(
          recentLogs.length > 0
            ? gte(foodEntries.loggedAt, sevenDaysAgo + 'T00:00:00.000Z')
            : gte(foodEntries.loggedAt, '2099-01-01') // no results
        );

      // Group by day
      const byDay: Record<string, DayMacros> = {};
      for (const entry of recentFoods) {
        const date = entry.loggedAt.slice(0, 10);
        if (!byDay[date]) {
          byDay[date] = { date, proteinG: 0, carbsG: 0, fatG: 0 };
        }
        byDay[date].proteinG += entry.proteinG;
        byDay[date].carbsG += entry.carbsG;
        byDay[date].fatG += entry.fatG;
      }

      // Fill last 7 days (including empty days)
      const days: DayMacros[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = nDaysAgo(i);
        days.push(byDay[date] ?? { date, proteinG: 0, carbsG: 0, fatG: 0 });
      }
      setMacroData(days);

      // Streak — collect all days that have food entries
      const allDates = recentFoods.map((e) => e.loggedAt.slice(0, 10));
      const uniqueDates = [...new Set(allDates)];
      setStreakDates(uniqueDates);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWeight() {
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) return;
    const weightKg = isLbs ? val / 2.205 : val;
    setSavingWeight(true);
    const today = nDaysAgo(0);
    try {
      await db.insert(weightLogs).values({
        date: today,
        weightKg: Math.round(weightKg * 10) / 10,
        loggedAt: new Date().toISOString(),
      });
      setLogWeightModal(false);
      setNewWeight('');
      loadData();
    } finally {
      setSavingWeight(false);
    }
  }

  // ─── Derived chart data ─────────────────────────────────────────────────

  const lineChartData: lineDataItem[] = weightData.map((w, i) => ({
    value: isLbs ? Math.round(kgToLbs(w.weightKg) * 10) / 10 : w.weightKg,
    label: i % Math.max(1, Math.floor(weightData.length / 5)) === 0
      ? shortDate(w.date)
      : '',
  }));

  const stackedBarData: stackDataItem[] = macroData.map((d) => ({
    label: shortDate(d.date),
    stacks: [
      { value: Math.round(d.proteinG), color: '#FF6B35' },
      { value: Math.round(d.carbsG), color: '#FFB800' },
      { value: Math.round(d.fatG), color: '#4A9EFF' },
    ],
  }));

  // BMI
  const latestWeight =
    weightData.length > 0 ? weightData[weightData.length - 1].weightKg : null;
  const heightM = profile ? profile.heightCm / 100 : null;
  const bmi =
    latestWeight && heightM
      ? Math.round((latestWeight / (heightM * heightM)) * 10) / 10
      : null;
  const bmiInfo = bmi ? bmiCategory(bmi) : null;

  const streak = calculateStreak(streakDates);

  const targetWeightDisplay =
    profile
      ? isLbs
        ? `${Math.round(kgToLbs(profile.targetWeightKg) * 10) / 10} lbs`
        : `${profile.targetWeightKg} kg`
      : null;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary dark:bg-dark-primary" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Text className="text-xl font-black text-text-primary dark:text-text-dark-primary">
          Analytics
        </Text>
        <Pressable
          onPress={() => setLogWeightModal(true)}
          className="bg-text-primary dark:bg-text-dark-primary rounded-full px-4 py-1.5"
        >
          <Text className="text-white text-xs font-bold">+ Weight</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Weight trend ─────────────────────────────── */}
          <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-3">
            Weight Trend
          </Text>

          {lineChartData.length < 2 ? (
            <View className="bg-white dark:bg-dark-secondary rounded-2xl p-5 items-center mb-5">
              <Text className="text-text-secondary dark:text-text-dark-secondary text-sm text-center">
                Log your weight daily to see your trend here.
              </Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-dark-secondary rounded-2xl p-4 mb-5 overflow-hidden">
              <LineChart
                data={lineChartData}
                width={CHART_WIDTH - 40}
                height={160}
                color="#000000"
                thickness={2}
                startFillColor="rgba(0,0,0,0.08)"
                endFillColor="rgba(0,0,0,0)"
                areaChart
                curved
                hideDataPoints={lineChartData.length > 20}
                dataPointsColor="#000000"
                dataPointsRadius={3}
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 9 }}
                rulesColor="#E5E5E5"
                noOfSections={4}
                yAxisLabelSuffix={isLbs ? ' lb' : ' kg'}
                hideRules={false}
                initialSpacing={10}
                endSpacing={10}
              />
              {targetWeightDisplay && (
                <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1 text-right">
                  Target: {targetWeightDisplay}
                </Text>
              )}
            </View>
          )}

          {/* ── Weekly macros ─────────────────────────────── */}
          <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-3">
            Weekly Macros
          </Text>

          <View className="bg-white dark:bg-dark-secondary rounded-2xl p-4 mb-5 overflow-hidden">
            {stackedBarData.every((d) =>
              d.stacks.every((s) => s.value === 0)
            ) ? (
              <Text className="text-text-secondary dark:text-text-dark-secondary text-sm text-center py-4">
                No food logged in the last 7 days.
              </Text>
            ) : (
              <>
                <BarChart
                  stackData={stackedBarData}
                  width={CHART_WIDTH - 48}
                  height={160}
                  barWidth={28}
                  spacing={12}
                  initialSpacing={8}
                  xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 9 }}
                  yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                  rulesColor="#E5E5E5"
                  noOfSections={4}
                  hideRules={false}
                  yAxisLabelSuffix="g"
                />
                {/* Legend */}
                <View className="flex-row mt-3 gap-4 justify-center">
                  {[
                    { color: '#FF6B35', label: 'Protein' },
                    { color: '#FFB800', label: 'Carbs' },
                    { color: '#4A9EFF', label: 'Fat' },
                  ].map(({ color, label }) => (
                    <View key={label} className="flex-row items-center gap-1.5">
                      <View
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                      <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* ── Stats row: BMI + Streak ───────────────────── */}
          <View className="flex-row gap-3 mb-5">
            {/* BMI card */}
            <View className="flex-1 bg-white dark:bg-dark-secondary rounded-2xl p-4">
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
                BMI
              </Text>
              {bmi ? (
                <>
                  <Text className="text-2xl font-black text-text-primary dark:text-text-dark-primary">
                    {bmi}
                  </Text>
                  <Text
                    className="text-xs font-bold mt-0.5"
                    style={{ color: bmiInfo!.color }}
                  >
                    {bmiInfo!.label}
                  </Text>
                </>
              ) : (
                <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
                  Log weight first
                </Text>
              )}
            </View>

            {/* Streak card */}
            <View className="flex-1 bg-white dark:bg-dark-secondary rounded-2xl p-4">
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
                Streak
              </Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-black text-text-primary dark:text-text-dark-primary">
                  {streak}
                </Text>
                <Text className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  days
                </Text>
              </View>
              <Text className="text-lg mt-0.5">🔥</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Log weight modal */}
      <Modal
        visible={logWeightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setLogWeightModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setLogWeightModal(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-secondary rounded-t-3xl pb-10 pt-5 px-5">
            <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Log Today's Weight
            </Text>
            <View className="flex-row items-center gap-3 mb-5">
              <TextInput
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                placeholder={isLbs ? 'e.g. 154.0' : 'e.g. 70.0'}
                placeholderTextColor="#9CA3AF"
                autoFocus
                className="flex-1 border border-border dark:border-dark-border rounded-2xl px-4 py-3 text-text-primary dark:text-text-dark-primary"
              />
              <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
                {isLbs ? 'lbs' : 'kg'}
              </Text>
            </View>
            <Pressable
              onPress={handleSaveWeight}
              disabled={savingWeight || !newWeight}
              className={`rounded-2xl py-4 items-center ${
                newWeight
                  ? 'bg-text-primary dark:bg-text-dark-primary'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              {savingWeight ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Save</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
