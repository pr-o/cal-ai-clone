import { create } from 'zustand';

export type Goal = 'lose' | 'maintain' | 'gain';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'gluten_free';

interface OnboardingState {
  goal: Goal | null;
  gender: Gender | null;
  birthday: string | null; // ISO date string YYYY-MM-DD
  currentWeightKg: number;
  heightCm: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel | null;
  dietaryPreferences: DietaryPreference[];

  setGoal: (goal: Goal) => void;
  setGender: (gender: Gender) => void;
  setBirthday: (birthday: string) => void;
  setCurrentWeightKg: (weight: number) => void;
  setHeightCm: (height: number) => void;
  setTargetWeightKg: (weight: number) => void;
  setActivityLevel: (level: ActivityLevel) => void;
  toggleDietaryPreference: (pref: DietaryPreference) => void;
  reset: () => void;
}

const initialState = {
  goal: null,
  gender: null,
  birthday: null,
  currentWeightKg: 70,
  heightCm: 170,
  targetWeightKg: 65,
  activityLevel: null,
  dietaryPreferences: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setGoal: (goal) => set({ goal }),
  setGender: (gender) => set({ gender }),
  setBirthday: (birthday) => set({ birthday }),
  setCurrentWeightKg: (currentWeightKg) => set({ currentWeightKg }),
  setHeightCm: (heightCm) => set({ heightCm }),
  setTargetWeightKg: (targetWeightKg) => set({ targetWeightKg }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),
  toggleDietaryPreference: (pref) =>
    set((state) => {
      if (pref === 'none') {
        return { dietaryPreferences: ['none'] };
      }
      const without = state.dietaryPreferences.filter(
        (p) => p !== 'none' && p !== pref
      );
      const hasIt = state.dietaryPreferences.includes(pref);
      return {
        dietaryPreferences: hasIt ? without : [...without, pref],
      };
    }),
  reset: () => set(initialState),
}));
