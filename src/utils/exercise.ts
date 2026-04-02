// MET (Metabolic Equivalent of Task) values for common exercises
// Calories burned ≈ MET × weight_kg × hours
// We use a default weight of 70 kg for the estimate

const MET_VALUES: Record<string, number> = {
  running: 9.8,
  walking: 3.5,
  cycling: 7.5,
  'strength training': 5.0,
  hiit: 12.0,
  swimming: 7.0,
  yoga: 3.0,
};

const DEFAULT_WEIGHT_KG = 70;

export function estimateCaloriesBurned(
  exerciseName: string,
  durationMinutes: number
): number {
  const key = exerciseName.toLowerCase().trim();
  // Try exact match first, then partial match
  const met =
    MET_VALUES[key] ??
    Object.entries(MET_VALUES).find(([k]) => key.includes(k))?.[1] ??
    5.0; // fallback MET
  return Math.round(met * DEFAULT_WEIGHT_KG * (durationMinutes / 60));
}

export const EXERCISE_SUGGESTIONS = [
  'Running',
  'Walking',
  'Cycling',
  'Strength Training',
  'HIIT',
  'Swimming',
  'Yoga',
];
