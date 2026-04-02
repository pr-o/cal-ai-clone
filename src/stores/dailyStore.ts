import { create } from 'zustand';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/index';
import {
  dailyLogs,
  foodEntries,
  exerciseEntries,
  type DailyLog,
  type FoodEntry,
  type ExerciseEntry,
  type NewFoodEntry,
  type NewExerciseEntry,
} from '@/db/schema';

interface DailyStore {
  // Current date being viewed
  currentDate: string;
  dailyLog: DailyLog | null;

  // Entries
  entries: FoodEntry[];
  exerciseList: ExerciseEntry[];
  waterMl: number;

  // Derived totals
  caloriesConsumed: number;
  caloriesFromExercise: number;
  caloriesRemaining: number; // set externally after profile hydrates
  macrosConsumed: { proteinG: number; carbsG: number; fatG: number };

  // Actions
  hydrateForDate: (date: string, goalCalories?: number) => Promise<void>;
  addFoodEntry: (
    entry: Omit<NewFoodEntry, 'dailyLogId' | 'loggedAt'>
  ) => Promise<void>;
  addExerciseEntry: (
    entry: Omit<NewExerciseEntry, 'dailyLogId' | 'loggedAt'>
  ) => Promise<void>;
  updateWater: (additionalMl: number) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  setCaloriesRemaining: (remaining: number) => void;
}

function computeTotals(entries: FoodEntry[], exercises: ExerciseEntry[]) {
  const caloriesConsumed = entries.reduce((sum, e) => sum + e.calories, 0);
  const caloriesFromExercise = exercises.reduce(
    (sum, e) => sum + e.caloriesBurned,
    0
  );
  const proteinG = entries.reduce((sum, e) => sum + e.proteinG, 0);
  const carbsG = entries.reduce((sum, e) => sum + e.carbsG, 0);
  const fatG = entries.reduce((sum, e) => sum + e.fatG, 0);
  return {
    caloriesConsumed,
    caloriesFromExercise,
    macrosConsumed: { proteinG, carbsG, fatG },
  };
}

export const useDailyStore = create<DailyStore>((set, get) => ({
  currentDate: '',
  dailyLog: null,
  entries: [],
  exerciseList: [],
  waterMl: 0,
  caloriesConsumed: 0,
  caloriesFromExercise: 0,
  caloriesRemaining: 0,
  macrosConsumed: { proteinG: 0, carbsG: 0, fatG: 0 },

  setCaloriesRemaining: (remaining) => set({ caloriesRemaining: remaining }),

  hydrateForDate: async (date, goalCalories) => {
    // Upsert daily log
    let log = (
      await db.select().from(dailyLogs).where(eq(dailyLogs.date, date)).limit(1)
    )[0];

    if (!log) {
      const inserted = await db
        .insert(dailyLogs)
        .values({ date, waterMl: 0 })
        .returning();
      log = inserted[0];
    }

    // Fetch entries
    const foods = await db
      .select()
      .from(foodEntries)
      .where(eq(foodEntries.dailyLogId, log.id));

    const exercises = await db
      .select()
      .from(exerciseEntries)
      .where(eq(exerciseEntries.dailyLogId, log.id));

    const totals = computeTotals(foods, exercises);
    const caloriesRemaining = goalCalories != null
      ? goalCalories + totals.caloriesFromExercise - totals.caloriesConsumed
      : get().caloriesRemaining;

    set({
      currentDate: date,
      dailyLog: log,
      entries: foods,
      exerciseList: exercises,
      waterMl: log.waterMl,
      caloriesRemaining,
      ...totals,
    });
  },

  addFoodEntry: async (entryData) => {
    const { dailyLog } = get();
    if (!dailyLog) return;

    const inserted = await db
      .insert(foodEntries)
      .values({
        ...entryData,
        dailyLogId: dailyLog.id,
        loggedAt: new Date().toISOString(),
      })
      .returning();

    const newEntries = [...get().entries, inserted[0]];
    const exercises = get().exerciseList;
    const totals = computeTotals(newEntries, exercises);
    set({
      entries: newEntries,
      caloriesRemaining:
        get().caloriesRemaining - inserted[0].calories,
      ...totals,
    });
  },

  addExerciseEntry: async (entryData) => {
    const { dailyLog } = get();
    if (!dailyLog) return;

    const inserted = await db
      .insert(exerciseEntries)
      .values({
        ...entryData,
        dailyLogId: dailyLog.id,
        loggedAt: new Date().toISOString(),
      })
      .returning();

    const newExercises = [...get().exerciseList, inserted[0]];
    const totals = computeTotals(get().entries, newExercises);
    set({
      exerciseList: newExercises,
      caloriesRemaining:
        get().caloriesRemaining + inserted[0].caloriesBurned,
      ...totals,
    });
  },

  updateWater: async (additionalMl) => {
    const { dailyLog, waterMl } = get();
    if (!dailyLog) return;

    const newWaterMl = waterMl + additionalMl;
    await db
      .update(dailyLogs)
      .set({ waterMl: newWaterMl })
      .where(eq(dailyLogs.id, dailyLog.id));

    set({ waterMl: newWaterMl });
  },

  deleteEntry: async (id) => {
    await db.delete(foodEntries).where(eq(foodEntries.id, id));
    const newEntries = get().entries.filter((e) => e.id !== id);
    const totals = computeTotals(newEntries, get().exerciseList);
    const deleted = get().entries.find((e) => e.id === id);
    set({
      entries: newEntries,
      caloriesRemaining:
        get().caloriesRemaining + (deleted?.calories ?? 0),
      ...totals,
    });
  },
}));
