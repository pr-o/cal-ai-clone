import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';

const storage = createMMKV({ id: 'settings' });

type Theme = 'light' | 'dark' | 'system';
type WeightUnit = 'kg' | 'lbs';

interface SettingsStore {
  // State
  theme: Theme;
  weightUnit: WeightUnit;
  onboardingComplete: boolean;
  reminderBreakfast: boolean;
  reminderLunch: boolean;
  reminderDinner: boolean;

  // API keys (read from MMKV at call time — not stored in Zustand memory)
  getGeminiApiKey: () => string;
  getNutritionixAppId: () => string;
  getNutritionixApiKey: () => string;

  // Setters
  setTheme: (theme: Theme) => void;
  setWeightUnit: (unit: WeightUnit) => void;
  setOnboardingComplete: (value: boolean) => void;
  setGeminiApiKey: (key: string) => void;
  setNutritionixAppId: (id: string) => void;
  setNutritionixApiKey: (key: string) => void;
  setReminderBreakfast: (value: boolean) => void;
  setReminderLunch: (value: boolean) => void;
  setReminderDinner: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>(() => ({
  // Hydrate synchronously from MMKV on store creation
  theme: (storage.getString('theme') as Theme) ?? 'system',
  weightUnit: (storage.getString('weight_unit') as WeightUnit) ?? 'kg',
  onboardingComplete: storage.getBoolean('onboarding_complete') ?? false,
  reminderBreakfast: storage.getBoolean('reminder_breakfast') ?? false,
  reminderLunch: storage.getBoolean('reminder_lunch') ?? false,
  reminderDinner: storage.getBoolean('reminder_dinner') ?? false,

  getGeminiApiKey: () => storage.getString('gemini_api_key') ?? '',
  getNutritionixAppId: () => storage.getString('nutritionix_app_id') ?? '',
  getNutritionixApiKey: () => storage.getString('nutritionix_api_key') ?? '',

  setTheme: (theme) => {
    storage.set('theme', theme);
    useSettingsStore.setState({ theme });
  },

  setWeightUnit: (unit) => {
    storage.set('weight_unit', unit);
    useSettingsStore.setState({ weightUnit: unit });
  },

  setOnboardingComplete: (value) => {
    storage.set('onboarding_complete', value);
    useSettingsStore.setState({ onboardingComplete: value });
  },

  setGeminiApiKey: (key) => storage.set('gemini_api_key', key),
  setNutritionixAppId: (id) => storage.set('nutritionix_app_id', id),
  setNutritionixApiKey: (key) => storage.set('nutritionix_api_key', key),

  setReminderBreakfast: (value) => {
    storage.set('reminder_breakfast', value);
    useSettingsStore.setState({ reminderBreakfast: value });
  },
  setReminderLunch: (value) => {
    storage.set('reminder_lunch', value);
    useSettingsStore.setState({ reminderLunch: value });
  },
  setReminderDinner: (value) => {
    storage.set('reminder_dinner', value);
    useSettingsStore.setState({ reminderDinner: value });
  },
}));
