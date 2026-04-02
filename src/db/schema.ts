import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  goal: text('goal').notNull(), // 'lose' | 'maintain' | 'gain'
  gender: text('gender').notNull(), // 'male' | 'female' | 'other'
  birthday: text('birthday').notNull(), // ISO date string YYYY-MM-DD
  currentWeightKg: real('current_weight_kg').notNull(),
  targetWeightKg: real('target_weight_kg').notNull(),
  heightCm: real('height_cm').notNull(),
  activityLevel: text('activity_level').notNull(), // 'sedentary' | 'light' | 'moderate' | 'active'
  dietaryPreferences: text('dietary_preferences').notNull().default('[]'), // JSON array string
  dailyCalories: integer('daily_calories').notNull(),
  dailyProteinG: integer('daily_protein_g').notNull(),
  dailyCarbsG: integer('daily_carbs_g').notNull(),
  dailyFatG: integer('daily_fat_g').notNull(),
  createdAt: text('created_at').notNull(), // ISO timestamp
});

export const dailyLogs = sqliteTable('daily_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(), // 'YYYY-MM-DD'
  waterMl: integer('water_ml').notNull().default(0),
});

export const foodEntries = sqliteTable('food_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dailyLogId: integer('daily_log_id')
    .notNull()
    .references(() => dailyLogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  servingSize: real('serving_size').notNull().default(1),
  servingUnit: text('serving_unit').notNull().default('serving'),
  mealType: text('meal_type').notNull().default('snack'), // 'breakfast' | 'lunch' | 'dinner' | 'snack'
  source: text('source').notNull().default('manual'), // 'ai_scan' | 'search' | 'manual'
  photoUri: text('photo_uri'), // nullable — local file path for AI-scanned items
  loggedAt: text('logged_at').notNull(), // ISO timestamp
});

export const exerciseEntries = sqliteTable('exercise_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dailyLogId: integer('daily_log_id')
    .notNull()
    .references(() => dailyLogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  caloriesBurned: integer('calories_burned').notNull(),
  loggedAt: text('logged_at').notNull(), // ISO timestamp
});

export const weightLogs = sqliteTable('weight_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  weightKg: real('weight_kg').notNull(),
  loggedAt: text('logged_at').notNull(), // ISO timestamp
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type NewFoodEntry = typeof foodEntries.$inferInsert;
export type ExerciseEntry = typeof exerciseEntries.$inferSelect;
export type NewExerciseEntry = typeof exerciseEntries.$inferInsert;
export type WeightLog = typeof weightLogs.$inferSelect;
export type NewWeightLog = typeof weightLogs.$inferInsert;
