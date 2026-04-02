import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { eq } from 'drizzle-orm';
import { colorScheme as nwColorScheme } from 'nativewind';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProfileStore } from '@/stores/profileStore';
import { db } from '@/db/index';
import { profiles } from '@/db/schema';
import {
  requestPermissions,
  scheduleMealReminder,
  cancelMealReminder,
} from '@/utils/notifications';

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-bold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-2 px-1">
        {title}
      </Text>
      <View className="bg-white dark:bg-dark-secondary rounded-2xl overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function Row({ children, last = false }: { children: React.ReactNode; last?: boolean }) {
  return (
    <View
      className={`px-4 py-3 ${!last ? 'border-b border-gray-100 dark:border-dark-border' : ''}`}
    >
      {children}
    </View>
  );
}

// ─── Segmented control ────────────────────────────────────────────────────────
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row bg-bg-secondary dark:bg-dark-primary rounded-xl p-0.5">
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          className={`flex-1 py-1.5 rounded-lg items-center ${
            value === opt.value
              ? 'bg-white dark:bg-dark-secondary shadow-sm'
              : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              value === opt.value
                ? 'text-text-primary dark:text-text-dark-primary'
                : 'text-text-secondary dark:text-text-dark-secondary'
            }`}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── API key row ──────────────────────────────────────────────────────────────
function ApiKeyRow({
  label,
  value,
  onChange,
  onSave,
  onTest,
  testStatus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onTest: () => void;
  testStatus: 'idle' | 'testing' | 'ok' | 'fail';
}) {
  return (
    <View>
      <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
        {label}
      </Text>
      <View className="flex-row gap-2 mb-2">
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry
          placeholder="Paste key here"
          placeholderTextColor="#9CA3AF"
          className="flex-1 border border-border dark:border-dark-border rounded-xl px-3 py-2 text-text-primary dark:text-text-dark-primary text-sm bg-bg-secondary dark:bg-dark-primary"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={onSave}
          className="bg-text-primary dark:bg-text-dark-primary rounded-xl px-3 items-center justify-center"
        >
          <Text className="text-white text-xs font-bold">Save</Text>
        </Pressable>
        <Pressable
          onPress={onTest}
          disabled={testStatus === 'testing'}
          className={`rounded-xl px-3 items-center justify-center ${
            testStatus === 'ok'
              ? 'bg-green-500'
              : testStatus === 'fail'
              ? 'bg-red-400'
              : 'bg-gray-200 dark:bg-dark-primary'
          }`}
        >
          {testStatus === 'testing' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              className={`text-xs font-bold ${
                testStatus === 'ok' || testStatus === 'fail'
                  ? 'text-white'
                  : 'text-text-secondary dark:text-text-dark-secondary'
              }`}
            >
              {testStatus === 'ok' ? '✓' : testStatus === 'fail' ? '✕' : 'Test'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setWeightUnit = useSettingsStore((s) => s.setWeightUnit);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const getGeminiApiKey = useSettingsStore((s) => s.getGeminiApiKey);
  const getNutritionixAppId = useSettingsStore((s) => s.getNutritionixAppId);
  const getNutritionixApiKey = useSettingsStore((s) => s.getNutritionixApiKey);
  const setGeminiApiKey = useSettingsStore((s) => s.setGeminiApiKey);
  const setNutritionixAppId = useSettingsStore((s) => s.setNutritionixAppId);
  const setNutritionixApiKey = useSettingsStore((s) => s.setNutritionixApiKey);

  const reminderBreakfast = useSettingsStore((s) => s.reminderBreakfast);
  const reminderLunch = useSettingsStore((s) => s.reminderLunch);
  const reminderDinner = useSettingsStore((s) => s.reminderDinner);
  const setReminderBreakfast = useSettingsStore((s) => s.setReminderBreakfast);
  const setReminderLunch = useSettingsStore((s) => s.setReminderLunch);
  const setReminderDinner = useSettingsStore((s) => s.setReminderDinner);

  const profile = useProfileStore((s) => s.profile);
  const dailyCalories = useProfileStore((s) => s.dailyCalories);
  const dailyProteinG = useProfileStore((s) => s.dailyProteinG);
  const dailyCarbsG = useProfileStore((s) => s.dailyCarbsG);
  const dailyFatG = useProfileStore((s) => s.dailyFatG);
  const updateGoals = useProfileStore((s) => s.updateGoals);

  // Local key state (shows current saved value)
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [nxAppId, setNxAppId] = useState(getNutritionixAppId());
  const [nxApiKey, setNxApiKey] = useState(getNutritionixApiKey());

  const [geminiTest, setGeminiTest] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [nxTest, setNxTest] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  // Edit goals modal
  const [editGoalsModal, setEditGoalsModal] = useState(false);
  const [editCalories, setEditCalories] = useState(String(dailyCalories));
  const [editProtein, setEditProtein] = useState(String(dailyProteinG));
  const [editCarbs, setEditCarbs] = useState(String(dailyCarbsG));
  const [editFat, setEditFat] = useState(String(dailyFatG));
  const [savingGoals, setSavingGoals] = useState(false);

  function handleThemeChange(t: typeof theme) {
    setTheme(t);
    nwColorScheme.set(t);
  }

  async function handleReminderToggle(
    meal: 'breakfast' | 'lunch' | 'dinner',
    enabled: boolean,
    hour: number,
    minute: number,
    setter: (v: boolean) => void
  ) {
    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in your device settings to receive meal reminders.'
        );
        return;
      }
      await scheduleMealReminder(hour, minute, meal);
    } else {
      await cancelMealReminder(meal);
    }
    setter(enabled);
  }

  async function testGemini() {
    setGeminiTest('testing');
    const key = getGeminiApiKey();
    if (!key) { setGeminiTest('fail'); return; }
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] }),
        }
      );
      setGeminiTest(res.ok ? 'ok' : 'fail');
    } catch { setGeminiTest('fail'); }
  }

  async function testNutritionix() {
    setNxTest('testing');
    const appId = getNutritionixAppId();
    const apiKey = getNutritionixApiKey();
    if (!appId || !apiKey) { setNxTest('fail'); return; }
    try {
      const res = await fetch(
        'https://trackapi.nutritionix.com/v2/natural/nutrients',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': appId,
            'x-app-key': apiKey,
          },
          body: JSON.stringify({ query: 'apple' }),
        }
      );
      setNxTest(res.ok ? 'ok' : 'fail');
    } catch { setNxTest('fail'); }
  }

  async function handleSaveGoals() {
    const cal = parseInt(editCalories, 10);
    const prot = parseInt(editProtein, 10);
    const carb = parseInt(editCarbs, 10);
    const fat = parseInt(editFat, 10);
    if ([cal, prot, carb, fat].some(isNaN)) return;
    setSavingGoals(true);
    try {
      await updateGoals({
        dailyCalories: cal,
        dailyProteinG: prot,
        dailyCarbsG: carb,
        dailyFatG: fat,
      });
      setEditGoalsModal(false);
    } finally {
      setSavingGoals(false);
    }
  }

  function handleResetOnboarding() {
    Alert.alert(
      'Reset Onboarding',
      'This will delete your profile and all settings. You will be sent back to the welcome screen. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            if (profile) {
              await db.delete(profiles).where(eq(profiles.id, profile.id));
            }
            setOnboardingComplete(false);
            router.replace('/onboarding/goal');
          },
        },
      ]
    );
  }

  const GOAL_LABELS: Record<string, string> = {
    lose: 'Lose weight',
    maintain: 'Maintain weight',
    gain: 'Gain muscle',
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary dark:bg-dark-primary" edges={['top']}>
      <Text className="text-xl font-black text-text-primary dark:text-text-dark-primary px-4 pt-2 pb-4">
        Settings
      </Text>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Appearance ─────────────────────────────── */}
        <Section title="Appearance">
          <Row>
            <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
              Theme
            </Text>
            <SegmentedControl
              options={[
                { label: 'Light', value: 'light' as const },
                { label: 'Dark', value: 'dark' as const },
                { label: 'System', value: 'system' as const },
              ]}
              value={theme}
              onChange={handleThemeChange}
            />
          </Row>
          <Row last>
            <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
              Weight unit
            </Text>
            <SegmentedControl
              options={[
                { label: 'kg', value: 'kg' as const },
                { label: 'lbs', value: 'lbs' as const },
              ]}
              value={weightUnit}
              onChange={setWeightUnit}
            />
          </Row>
        </Section>

        {/* ── API Keys ───────────────────────────────── */}
        <Section title="API Keys">
          <Row>
            <ApiKeyRow
              label="Gemini API Key"
              value={geminiKey}
              onChange={setGeminiKey}
              onSave={() => setGeminiApiKey(geminiKey)}
              onTest={testGemini}
              testStatus={geminiTest}
            />
          </Row>
          <Row>
            <ApiKeyRow
              label="Nutritionix App ID"
              value={nxAppId}
              onChange={setNxAppId}
              onSave={() => setNutritionixAppId(nxAppId)}
              onTest={testNutritionix}
              testStatus={nxTest}
            />
          </Row>
          <Row last>
            <ApiKeyRow
              label="Nutritionix API Key"
              value={nxApiKey}
              onChange={setNxApiKey}
              onSave={() => setNutritionixApiKey(nxApiKey)}
              onTest={testNutritionix}
              testStatus={nxTest}
            />
          </Row>
        </Section>

        {/* ── Profile / Goals ────────────────────────── */}
        {profile && (
          <Section title="Goals">
            <Row>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  Goal
                </Text>
                <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {GOAL_LABELS[profile.goal] ?? profile.goal}
                </Text>
              </View>
            </Row>
            <Row>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  Daily calories
                </Text>
                <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {dailyCalories} kcal
                </Text>
              </View>
            </Row>
            <Row>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  Macros
                </Text>
                <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  P {dailyProteinG}g · C {dailyCarbsG}g · F {dailyFatG}g
                </Text>
              </View>
            </Row>
            <Row last>
              <Pressable
                onPress={() => {
                  setEditCalories(String(dailyCalories));
                  setEditProtein(String(dailyProteinG));
                  setEditCarbs(String(dailyCarbsG));
                  setEditFat(String(dailyFatG));
                  setEditGoalsModal(true);
                }}
                className="items-center py-1"
              >
                <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  Edit Goals ✏️
                </Text>
              </Pressable>
            </Row>
          </Section>
        )}

        {/* ── Reminders ─────────────────────────────── */}
        <Section title="Meal Reminders">
          {(
            [
              {
                label: 'Breakfast',
                time: '8:00 AM',
                value: reminderBreakfast,
                setter: setReminderBreakfast,
                hour: 8,
                minute: 0,
                meal: 'breakfast' as const,
              },
              {
                label: 'Lunch',
                time: '12:00 PM',
                value: reminderLunch,
                setter: setReminderLunch,
                hour: 12,
                minute: 0,
                meal: 'lunch' as const,
              },
              {
                label: 'Dinner',
                time: '7:00 PM',
                value: reminderDinner,
                setter: setReminderDinner,
                hour: 19,
                minute: 0,
                meal: 'dinner' as const,
              },
            ] as const
          ).map(({ label, time, value, setter, hour, minute, meal }, idx, arr) => (
            <Row key={meal} last={idx === arr.length - 1}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                    {label}
                  </Text>
                  <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                    {time}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(enabled) =>
                    handleReminderToggle(meal, enabled, hour, minute, setter)
                  }
                  trackColor={{ false: '#D1D5DB', true: '#000000' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Row>
          ))}
        </Section>

        {/* ── Danger zone ───────────────────────────── */}
        <Section title="Danger Zone">
          <Row last>
            <Pressable onPress={handleResetOnboarding} className="items-center py-1">
              <Text className="text-sm font-medium text-red-500">
                Reset Onboarding & Profile
              </Text>
            </Pressable>
          </Row>
        </Section>
      </ScrollView>

      {/* Edit Goals Modal */}
      <Modal
        visible={editGoalsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditGoalsModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setEditGoalsModal(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-secondary rounded-t-3xl pb-10 pt-5 px-5">
            <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Edit Daily Goals
            </Text>

            {(
              [
                { label: 'Calories (kcal)', value: editCalories, set: setEditCalories },
                { label: 'Protein (g)', value: editProtein, set: setEditProtein },
                { label: 'Carbs (g)', value: editCarbs, set: setEditCarbs },
                { label: 'Fat (g)', value: editFat, set: setEditFat },
              ] as const
            ).map(({ label, value, set }) => (
              <View key={label} className="flex-row items-center mb-3">
                <Text className="text-sm text-text-secondary dark:text-text-dark-secondary w-36">
                  {label}
                </Text>
                <TextInput
                  value={value}
                  onChangeText={set}
                  keyboardType="number-pad"
                  className="flex-1 border border-border dark:border-dark-border rounded-xl px-3 py-2 text-text-primary dark:text-text-dark-primary text-sm"
                />
              </View>
            ))}

            <Pressable
              onPress={handleSaveGoals}
              disabled={savingGoals}
              className="bg-text-primary dark:bg-text-dark-primary rounded-2xl py-4 items-center mt-2"
            >
              {savingGoals ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Save Goals</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
