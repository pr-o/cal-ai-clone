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
