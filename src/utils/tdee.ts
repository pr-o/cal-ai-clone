export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export interface TDEEInput {
  gender: 'male' | 'female' | 'other';
  birthday: string; // YYYY-MM-DD
  currentWeightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const GOAL_CALORIE_DELTA: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

function getAgeFromBirthday(birthday: string): number {
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Mifflin-St Jeor BMR */
function calculateBMR(input: TDEEInput): number {
  const { gender, currentWeightKg: w, heightCm: h, birthday } = input;
  const age = getAgeFromBirthday(birthday);
  // Male:   10w + 6.25h - 5age + 5
  // Female: 10w + 6.25h - 5age - 161
  // Other:  average of male and female
  const base = 10 * w + 6.25 * h - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78; // average of +5 and -161
}

/**
 * Calculate TDEE and daily macro targets using Mifflin-St Jeor.
 * Protein: 2g/kg bodyweight for lose/gain; 1.8g/kg for maintain
 * Fat: 25% of calories
 * Carbs: remainder
 */
export function calculateTDEE(input: TDEEInput): MacroTargets {
  const bmr = calculateBMR(input);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[input.activityLevel]);
  const calories = Math.max(1200, tdee + GOAL_CALORIE_DELTA[input.goal]);

  const proteinMultiplier = input.goal === 'maintain' ? 1.8 : 2.0;
  const proteinG = Math.round(input.currentWeightKg * proteinMultiplier);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);

  return {
    calories,
    proteinG,
    carbsG: Math.max(0, carbsG),
    fatG,
  };
}
