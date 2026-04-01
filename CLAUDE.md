# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A React Native (Expo) clone of **Cal AI** — an AI-powered calorie tracking app. Users complete a multi-step onboarding, then log meals via AI photo scanning (Gemini 2.0 Flash), food text search (Nutritionix), exercise, and water. All data is stored locally on-device (no backend, no auth).

Full design spec: `docs/superpowers/specs/2026-04-02-cal-ai-clone-design.md`  
UI reference screenshots: `.claude/screenshots/README.md`

---

## Commands

```bash
# Install dependencies
npm install

# Start dev server (Expo Go)
npx expo start

# Start with cache cleared
npx expo start --clear

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Generate Drizzle migrations after schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Type check
npx tsc --noEmit

# Lint
npx eslint .

# Run all tests
npx jest

# Run a single test file
npx jest src/utils/tdee.test.ts

# EAS build (requires EAS CLI + account)
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

---

## Architecture

### Navigation (Expo Router v4 — file-based)

Three top-level route groups with distinct layouts:

- **`app/onboarding/`** — Stack navigator, no tab bar. Entry point for first-time users. Exits to `/(tabs)/` after saving the profile.
- **`app/(tabs)/`** — Bottom tab bar: Home | Analytics | Settings.
- **`app/log/`** — Modal/stack screens for logging food (camera, scan result, search, exercise, water). Pushed over the tab bar.

`app/index.tsx` is the router gate: reads MMKV `onboarding_complete` → redirects to `/onboarding/goal` or `/(tabs)/`.

### State Architecture

Two persistence layers with distinct responsibilities:

- **MMKV** (`react-native-mmkv`) — synchronous key-value for settings and flags: `onboarding_complete`, `theme`, `weight_unit`, API keys. Read/written via `src/stores/settingsStore.ts`.
- **expo-sqlite + Drizzle ORM** — relational local DB for all tracking data. Schema in `src/db/schema.ts`. Tables: `profiles`, `dailyLogs`, `foodEntries`, `exerciseEntries`, `weightLogs`.

Three Zustand stores sit above the persistence layer as in-memory state:
- `profileStore` — user goals + macro targets (hydrated from `profiles` table at app start)
- `dailyStore` — today's consumed totals + entries list (rehydrated on every home screen focus)
- `settingsStore` — theme + units (reads/writes MMKV directly, no SQLite)

### AI Food Scan Flow

`log/camera.tsx` (VisionCamera) → base64 encode → `src/services/gemini.ts` → Gemini 2.0 Flash Vision API → JSON parse → `log/scan-result.tsx` (editable) → Drizzle insert → dailyStore update.

The Gemini API key is stored in MMKV and entered once by the user in Settings. `services/gemini.ts` reads it at call time.

### Food Text Search Flow

`log/search.tsx` → `src/services/nutritionix.ts` → Nutritionix `/v2/natural/nutrients` → results list → confirm → Drizzle insert → dailyStore update.

### Onboarding

10 sequential screens in `app/onboarding/`. Data accumulates in a `onboardingState` Zustand slice (not written to SQLite until the final step). `plan.tsx` computes TDEE using the Mifflin-St Jeor formula (`src/utils/tdee.ts`) and displays 4 editable donut rings. On "Let's get started!" → single `INSERT INTO profiles` → MMKV gate set → navigate to tabs.

### Dark Mode

NativeWind v4 `colorScheme` — all components use `dark:` Tailwind variants. `settingsStore.theme` (`'light' | 'dark' | 'system'`) is persisted to MMKV and applied at `app/_layout.tsx`.

---

## Key Conventions

- **Path alias:** `@/*` maps to `src/*` (configured in `tsconfig.json` and `babel.config.js`).
- **Drizzle schema changes** always require running `npx drizzle-kit generate` followed by `npx drizzle-kit migrate`. Never edit migration files manually.
- **API keys** are never hardcoded. They live in MMKV under `gemini_api_key`, `nutritionix_app_id`, `nutritionix_api_key`. The Settings screen is where users enter them.
- **Units:** Internal storage is always metric (kg, cm, ml). `src/utils/units.ts` handles display conversion when `weight_unit = 'lbs'`.
- **Dates:** All dates stored as `'YYYY-MM-DD'` strings. All timestamps stored as ISO 8601 strings. No `Date` objects in the DB layer.
- **VisionCamera** requires a custom native build — it does not work in Expo Go. Use `npx expo run:ios` / `npx expo run:android` or EAS Build for any camera testing.

---

## Implementation Plan

Phases are sequential. Complete every checkbox in a phase before starting the next. Each checkbox is one discrete, testable unit of work.

---

### Phase 0 — Project Scaffolding

- [ ] Bootstrap project: `npx create-expo-app@latest . --template blank-typescript`
- [ ] Install core dependencies: `expo-router`, `react-native-mmkv`, `zustand`, `nativewind`, `tailwindcss`
- [ ] Install DB dependencies: `expo-sqlite`, `drizzle-orm`, `drizzle-kit`
- [ ] Install camera dependencies: `react-native-vision-camera`
- [ ] Install chart + notification dependencies: `react-native-gifted-charts`, `expo-notifications`
- [ ] Install utility dependencies: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`
- [ ] Configure NativeWind: create `tailwind.config.js` with custom color tokens (see UI section in spec), update `babel.config.js` with NativeWind preset
- [ ] Configure path alias `@/*` → `src/*` in `tsconfig.json` and `babel.config.js`
- [ ] Configure Expo Router: set `"main": "expo-router/entry"` in `package.json`, add `scheme` in `app.json`
- [ ] Create `.env` file with placeholder keys: `EXPO_PUBLIC_GEMINI_API_KEY`, `EXPO_PUBLIC_NUTRITIONIX_APP_ID`, `EXPO_PUBLIC_NUTRITIONIX_API_KEY`
- [ ] Verify `npx tsc --noEmit` passes with zero errors on the empty scaffold
- [ ] Verify `npx expo start` boots without errors

---

### Phase 1 — Database & Storage Layer

- [ ] Create `src/db/schema.ts` — define all five Drizzle tables: `profiles`, `dailyLogs`, `foodEntries`, `exerciseEntries`, `weightLogs` (exact columns per spec Section 3)
- [ ] Create `src/db/index.ts` — open expo-sqlite connection, instantiate drizzle, export `db` singleton
- [ ] Run `npx drizzle-kit generate` to produce the initial migration file under `drizzle/`
- [ ] Run `npx drizzle-kit migrate` and confirm the migration applies cleanly
- [ ] Create `src/stores/settingsStore.ts` — Zustand store backed by MMKV; exposes `theme`, `weightUnit`, all API key getters/setters, `onboardingComplete` flag
- [ ] Verify MMKV reads/writes synchronously by writing a simple manual test in a scratch file, then delete it

---

### Phase 2 — Shared Components & Utilities

- [ ] Create `src/utils/tdee.ts` — implement Mifflin-St Jeor formula; export `calculateTDEE(profile)` returning `{ calories, proteinG, carbsG, fatG }`
- [ ] Create `src/utils/units.ts` — export `kgToLbs`, `lbsToKg`, `cmToFtIn`, `ftInToCm`, `mlToOz`, `ozToMl`
- [ ] Create `src/utils/streaks.ts` — export `calculateStreak(dates: string[])` that counts consecutive days ending today
- [ ] Write unit tests for all three utility files (`src/utils/*.test.ts`); run `npx jest` and confirm all pass
- [ ] Create `src/components/OnboardingLayout.tsx` — wraps children with: back arrow (left), thin linear progress bar (center, driven by `step/total` prop), safe area insets, white background
- [ ] Create `src/components/RulerPicker.tsx` — horizontal `ScrollView` with evenly spaced tick marks; center-pinned selected value displayed large and bold above the ruler; accepts `value`, `min`, `max`, `step`, `unit`, `onChange` props
- [ ] Create `src/components/CalorieRing.tsx` — SVG donut ring accepting `consumed`, `goal`, `size` props; flame icon centered; animates fill on mount via Reanimated
- [ ] Create `src/components/MacroPill.tsx` — displays remaining grams + label + colored icon; accepts `type` (`protein` | `carbs` | `fat`), `remaining`, `goal` props
- [ ] Create `src/components/FoodEntryCard.tsx` — card with optional food photo thumbnail (left), food name (bold), kcal + P/C/F inline (right); swipe-to-delete via Gesture Handler
- [ ] Create `src/components/WeekStrip.tsx` — 7-day horizontal strip; active day highlighted with black pill; tapping a past day calls `onDaySelect(date)` prop

---

### Phase 3 — Onboarding Screens

- [ ] Create `src/stores/onboardingStore.ts` — temporary Zustand slice holding all onboarding fields (`goal`, `gender`, `birthday`, `currentWeightKg`, `heightCm`, `targetWeightKg`, `activityLevel`, `dietaryPreferences`); not persisted to SQLite until final step
- [ ] Create `app/onboarding/_layout.tsx` — Expo Router Stack with header hidden (progress bar is in `OnboardingLayout`, not the native header)
- [ ] Build `app/onboarding/goal.tsx` — 3 option pills (Lose weight / Maintain / Gain muscle); tapping a pill sets `onboardingStore.goal` and calls `router.push('/onboarding/gender')`
- [ ] Build `app/onboarding/gender.tsx` — 3 option pills (Male / Female / Other)
- [ ] Build `app/onboarding/birthday.tsx` — date wheel picker (platform-native); stores ISO date string
- [ ] Build `app/onboarding/current-weight.tsx` — `RulerPicker` (40–200 kg range, 0.1 step); unit label from `settingsStore.weightUnit`
- [ ] Build `app/onboarding/height.tsx` — `RulerPicker` (100–250 cm range); shows ft/in label when `weightUnit = 'lbs'`
- [ ] Build `app/onboarding/target-weight.tsx` — `RulerPicker` with goal label ("Lose weight") displayed above the value
- [ ] Build `app/onboarding/activity.tsx` — 4 option pills (Sedentary / Lightly active / Active / Very active)
- [ ] Build `app/onboarding/diet.tsx` — multi-select pills (None / Vegetarian / Vegan / Keto / Gluten-free); multiple can be active simultaneously
- [ ] Build `app/onboarding/results.tsx` — static motivational screen; animated line chart comparing "Cal AI" vs "Traditional Diet" weight curves over 6 months; "80% of users maintain weight loss 6 months later" stat; no user input, just "Next" CTA
- [ ] Build `app/onboarding/plan.tsx` — call `calculateTDEE(onboardingStore)` on mount; display 4 editable donut rings (Calories, Protein, Carbs, Fat) in a 2×2 grid; each ring has a pencil icon that opens an inline edit input; "Let's get started!" button at bottom
- [ ] Wire "Let's get started!" in `plan.tsx`: `INSERT INTO profiles` via Drizzle with all onboarding values + calculated goals → `settingsStore.setOnboardingComplete(true)` → `router.replace('/(tabs)/')`
- [ ] Manually walk through all 10 onboarding steps end-to-end on simulator and confirm profile row is written to DB

---

### Phase 4 — Root Layout & Navigation Shell

- [ ] Create `app/_layout.tsx` — load custom fonts (Inter via `expo-font`), initialize DB migrations on first run (`db.run(migrate(...))`), wrap app in NativeWind `colorScheme` provider driven by `settingsStore.theme`, render `<Stack />`
- [ ] Create `app/index.tsx` — read `settingsStore.onboardingComplete`; if false `router.replace('/onboarding/goal')`, else `router.replace('/(tabs)/')`
- [ ] Create `app/(tabs)/_layout.tsx` — `<Tabs>` with three tabs: Home (house icon), Analytics (bar chart icon), Settings (gear icon); tab bar styled to match Cal AI (black active tint, gray inactive)
- [ ] Create stub screens for `app/(tabs)/index.tsx`, `app/(tabs)/analytics.tsx`, `app/(tabs)/settings.tsx` — each renders a centered placeholder `<Text>` so navigation can be verified
- [ ] Verify full navigation shell: fresh install → onboarding → plan → tabs; re-launch → goes directly to tabs

---

### Phase 5 — Zustand Stores & Daily Data Layer

- [ ] Create `src/stores/profileStore.ts` — on `hydrate()`, query `SELECT * FROM profiles LIMIT 1` via Drizzle; expose `profile`, `dailyCalories`, `dailyProteinG`, `dailyCarbsG`, `dailyFatG`
- [ ] Create `src/stores/dailyStore.ts` — on `hydrateForDate(date)`, query `dailyLogs` (upsert if missing), `foodEntries`, `exerciseEntries` for that date; derive and expose `caloriesConsumed`, `caloriesFromExercise`, `caloriesRemaining`, `macrosConsumed`, `entries`, `waterMl`; expose `addFoodEntry`, `addExerciseEntry`, `updateWater`, `deleteEntry` mutators that write to Drizzle then update in-memory state
- [ ] Call `profileStore.hydrate()` and `dailyStore.hydrateForDate(today)` inside `app/_layout.tsx` after DB init completes

---

### Phase 6 — Home Dashboard Screen

- [ ] Build `app/(tabs)/index.tsx` fully:
  - [ ] `WeekStrip` at top — tapping a past day calls `dailyStore.hydrateForDate(selectedDate)`
  - [ ] Streak count + flame icon (top right, from `calculateStreak`)
  - [ ] `CalorieRing` (large, center-top of content area) showing `caloriesRemaining / dailyCalories`
  - [ ] Row of three `MacroPill` components (Protein, Carbs, Fat)
  - [ ] "Recently logged" section header
  - [ ] `FlatList` of `FoodEntryCard` items from `dailyStore.entries`; empty state shows "Start tracking today's meals by taking a quick picture" with a sketch icon
  - [ ] FAB "+" button (bottom-right, black circle) — opens a bottom sheet with four options: Camera, Search, Exercise, Water
  - [ ] Bottom sheet options navigate to: `router.push('/log/camera')`, `router.push('/log/search')`, `router.push('/log/exercise')`, `router.push('/log/water')`

---

### Phase 7 — AI Food Scan (Camera + Gemini)

- [ ] Add camera and microphone permissions to `app.json` (`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, Android equivalents)
- [ ] Create `app/log/camera.tsx` — fullscreen `VisionCamera` with a circular shutter button at the bottom center; on capture, save photo to `FileSystem.cacheDirectory`, navigate to `scan-result` passing the local `photoUri`
- [ ] Create `src/services/gemini.ts` — export `async function analyzeFood(base64Image: string, correctionHint?: string)` that POSTs to Gemini 2.0 Flash endpoint with the structured JSON prompt; parses and returns `{ name, calories, proteinG, carbsG, fatG, servingSize, healthScore }`; throws a typed error if the response cannot be parsed
- [ ] Create `app/log/scan-result.tsx`:
  - [ ] Full-bleed food photo at top (~45% screen height) using the passed `photoUri`
  - [ ] "Nutrition" header overlaid on photo (white text, back arrow left, share icon right)
  - [ ] Timestamp + food name (bold, editable `TextInput`)
  - [ ] Servings picker (inline `+`/`-` buttons; scales all macros proportionally)
  - [ ] Calories row with flame icon (large bold number, also scales with servings)
  - [ ] Protein / Carbs / Fat inline row (also scales)
  - [ ] "Health Score X/10" with a green `ProgressBar`
  - [ ] "Ingredients" section (collapsed by default, populated from Gemini response if available)
  - [ ] "Fix Results" button — prompts user for a correction string, re-calls `analyzeFood` with the hint, updates UI
  - [ ] "Done" button — calls `dailyStore.addFoodEntry(entry)` → navigates back to `/(tabs)/`
- [ ] Test the full scan flow on a real device or simulator with a food photo

---

### Phase 8 — Food Text Search (Nutritionix)

- [ ] Create `src/services/nutritionix.ts` — export `async function searchFoods(query: string)` that POSTs to `/v2/natural/nutrients` with `x-app-id` + `x-app-key` headers from MMKV; returns array of `{ name, calories, proteinG, carbsG, fatG, servingSize, servingUnit, photoUrl }`
- [ ] Create `app/log/search.tsx`:
  - [ ] Search input auto-focused on mount
  - [ ] Debounced calls to `searchFoods` as user types (300ms debounce)
  - [ ] `FlatList` of results — each item shows food name, kcal, serving size, and thumbnail image
  - [ ] Tapping a result navigates to a confirm screen (inline bottom sheet or new screen) showing full macro breakdown
  - [ ] "Add" button — calls `dailyStore.addFoodEntry(entry)` with `source: 'search'` → navigates back to `/(tabs)/`
  - [ ] Empty state when query is blank; error state when API key is missing (prompt user to add key in Settings)

---

### Phase 9 — Exercise & Water Logging

- [ ] Create `app/log/exercise.tsx`:
  - [ ] Text input for exercise name (with common suggestions: Running, Walking, Cycling, Strength Training, HIIT, Swimming, Yoga)
  - [ ] Duration input (minutes) via number pad
  - [ ] Calories burned input (number pad) — pre-filled with a rough estimate based on name + duration (MET values in a small lookup table in `src/utils/exercise.ts`)
  - [ ] "Log Exercise" button — calls `dailyStore.addExerciseEntry(entry)` → navigates back
- [ ] Create `app/log/water.tsx`:
  - [ ] Four quick-add buttons: 250 ml, 500 ml, 750 ml, 1000 ml
  - [ ] Custom amount input (number pad)
  - [ ] Shows today's total water so far + a simple progress bar toward a 2500 ml default goal
  - [ ] "Add" button — calls `dailyStore.updateWater(additionalMl)` → navigates back

---

### Phase 10 — Analytics Screen

- [ ] Build `app/(tabs)/analytics.tsx`:
  - [ ] **Weight trend section** — query `weightLogs` last 90 days via Drizzle; render Gifted Charts `LineChart`; x-axis = date labels, y-axis = weight; show current weight and target weight as horizontal reference lines
  - [ ] **Weekly macros section** — query `foodEntries` for the last 7 days grouped by date; render Gifted Charts `BarChart` with stacked protein/carbs/fat bars per day
  - [ ] **BMI card** — calculate from `profileStore.profile.heightCm` + latest `weightLogs` entry; color-coded label (underweight / normal / overweight / obese)
  - [ ] **Streak card** — call `calculateStreak` on dates from `foodEntries`; display count + flame icon
  - [ ] **Log weight button** — opens a small modal with a number input + "Save" that inserts into `weightLogs`

---

### Phase 11 — Settings Screen

- [ ] Build `app/(tabs)/settings.tsx`:
  - [ ] **Theme** — segmented control: Light / Dark / System; writes to `settingsStore.theme` (MMKV); theme change applies immediately via root layout re-render
  - [ ] **Weight unit** — toggle: kg / lbs; writes to `settingsStore.weightUnit`; all displayed values update immediately
  - [ ] **API Keys section** — three masked `TextInput` fields for `gemini_api_key`, `nutritionix_app_id`, `nutritionix_api_key`; "Save" button writes to MMKV; show a "Test" button per key that makes a minimal API call and displays success/failure inline
  - [ ] **Profile section** — display current goal, daily calorie target, macro targets; "Edit Goals" opens a modal reusing the plan screen's donut rings so user can adjust targets post-onboarding
  - [ ] **Reset onboarding** — destructive button (red, confirmation dialog) that clears `onboarding_complete` from MMKV and deletes the `profiles` row → navigates to `/onboarding/goal`

---

### Phase 12 — Dark Mode Polish

- [ ] Audit every screen and component for missing `dark:` Tailwind variants — every `bg-`, `text-`, `border-` class must have a `dark:` counterpart
- [ ] Verify `CalorieRing`, `MacroPill`, `FoodEntryCard`, `WeekStrip`, `RulerPicker`, `OnboardingLayout` all render correctly in both modes
- [ ] Test theme switching in Settings — confirm the entire app re-renders without a reload
- [ ] Verify status bar style switches between `dark-content` (light mode) and `light-content` (dark mode) using `expo-status-bar`

---

### Phase 13 — Push Notifications (Meal Reminders)

- [ ] Add `expo-notifications` and run `npx expo install expo-notifications`
- [ ] Create `src/utils/notifications.ts` — export `requestPermissions()`, `scheduleMealReminder(hour, minute, label)`, `cancelAllReminders()`
- [ ] In Settings screen, add a **Reminders section** with toggles for breakfast (8 AM), lunch (12 PM), and dinner (7 PM) reminders; each toggle calls `scheduleMealReminder` or `cancelAllReminders` as appropriate
- [ ] Persist reminder toggle states to MMKV (`reminder_breakfast`, `reminder_lunch`, `reminder_dinner`)
- [ ] Test that notifications fire correctly on device (simulators have limited notification support)

---

### Phase 14 — Final Testing & Cleanup

- [ ] Run `npx tsc --noEmit` — zero type errors
- [ ] Run `npx eslint .` — zero lint errors
- [ ] Run `npx jest` — all unit tests pass
- [ ] Walk through the full happy path end-to-end: fresh install → onboarding → home → scan food → view result → confirm → home updates → search food → add → home updates → log exercise → log water → analytics shows data → settings theme toggle → dark mode looks correct
- [ ] Test edge cases: no API key set (graceful error), Gemini returns unparseable JSON (Fix Results shown), empty food log (empty state shown), first day (no streak yet)
- [ ] Remove all `console.log` debug statements
- [ ] Confirm `.env` is in `.gitignore` and no API keys are hardcoded anywhere in source
