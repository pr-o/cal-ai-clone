# Cal AI 클론

AI 기반 칼로리 추적 앱 Cal AI를 재현한 크로스플랫폼 모바일 클론 프로젝트

---

# Cal AI 클론

Cal AI의 핵심 경험을 재현한 React Native(Expo) 기반 모바일 앱 클론 프로젝트

사진 촬영으로 음식을 인식해 즉시 칼로리와 영양소를 파악하는 AI 기반 칼로리 추적 앱이다. 10단계 온보딩을 통해 사용자 맞춤 목표를 설정하고, Gemini 2.0 Flash Vision API로 음식 사진을 분석하며, Nutritionix API로 음식을 텍스트 검색한다. 별도 백엔드나 로그인 없이 모든 데이터를 기기 내 SQLite에 저장하는 로컬 전용 앱이다.

## 기술 스택

| 역할 | 라이브러리 | 버전 |
|---|---|---|
| 프레임워크 | Expo Managed Workflow + EAS Build | SDK 55 (RN 0.83) |
| 언어 | TypeScript (strict mode) | 5.8.x |
| 내비게이션 | Expo Router | ^4.x |
| 상태 관리 | Zustand | ^5.x |
| 스타일링 | NativeWind (Tailwind for RN) | ^4.1.x |
| 카메라 | react-native-vision-camera | ^4.7.x |
| AI 음식 인식 | Google Gemini 2.0 Flash Vision API | REST |
| 음식 텍스트 검색 | Nutritionix API | REST |
| 로컬 DB | expo-sqlite + Drizzle ORM | sqlite ~15.x, drizzle ^0.40.x |
| 키-값 저장소 | react-native-mmkv | ^4.3.x |
| 차트 | react-native-gifted-charts | latest |
| 푸시 알림 | expo-notifications | ~0.31.x |
| 테스트 | Jest + React Native Testing Library | ^30.x / ^13.x |

## 프로젝트 구조

```
app/
├── _layout.tsx              # 루트: 폰트, 테마 프로바이더, DB 초기화, MMKV 게이트
├── index.tsx                # 라우터 게이트 → 온보딩 또는 탭으로 리다이렉트
├── onboarding/              # 탭 바 없는 스택 — 최초 실행 시 진입
│   ├── goal.tsx             # 목표 선택 (감량 / 유지 / 증량)
│   ├── gender.tsx           # 성별 선택
│   ├── birthday.tsx         # 생년월일 입력
│   ├── current-weight.tsx   # 현재 체중 (룰러 피커)
│   ├── height.tsx           # 키 (룰러 피커)
│   ├── target-weight.tsx    # 목표 체중 (룰러 피커)
│   ├── activity.tsx         # 활동 수준 (4가지 옵션)
│   ├── diet.tsx             # 식이 선호도 (복수 선택)
│   ├── results.tsx          # "Cal AI로 장기적인 결과를" + 체중 예측 그래프
│   └── plan.tsx             # 생성된 플랜 — 편집 가능한 도넛 링 4개
├── (tabs)/                  # 하단 탭 바: 홈 | 분석 | 설정
│   ├── index.tsx            # 홈 대시보드
│   ├── analytics.tsx        # 체중 추이 + 영양소 히스토리 차트
│   └── settings.tsx         # 테마, 단위, API 키 설정
└── log/                     # 탭 위로 푸시되는 음식 기록 모달 스크린
    ├── camera.tsx           # VisionCamera 전체화면 촬영
    ├── scan-result.tsx      # Gemini 결과 — 필드 편집 후 확인
    ├── search.tsx           # Nutritionix 텍스트 검색
    ├── exercise.tsx         # 운동 기록 (이름, 시간, 소모 칼로리)
    └── water.tsx            # 수분 섭취 기록

src/
├── db/
│   ├── schema.ts            # Drizzle 테이블 정의
│   ├── index.ts             # expo-sqlite 연결 + drizzle 인스턴스
│   └── migrations/          # drizzle-kit 자동 생성 마이그레이션
├── stores/
│   ├── profileStore.ts      # 사용자 프로필 + 영양소 목표
│   ├── dailyStore.ts        # 오늘의 기록, 섭취 합계, 수분, 운동
│   └── settingsStore.ts     # 테마 + 단위 (MMKV 기반)
├── services/
│   ├── gemini.ts            # Gemini 2.0 Flash Vision API 호출
│   └── nutritionix.ts       # 음식 텍스트 검색 API 호출
├── utils/
│   ├── tdee.ts              # Mifflin-St Jeor TDEE + 영양소 계산
│   ├── streaks.ts           # 연속 기록 스트릭 계산
│   └── units.ts             # kg↔lbs, cm↔ft/in 단위 변환
└── components/
    ├── CalorieRing.tsx       # SVG 원형 진행 링
    ├── MacroPill.tsx         # 단백질 / 탄수화물 / 지방 남은 양 필
    ├── FoodEntryCard.tsx     # 음식 기록 카드 (썸네일 포함)
    ├── RulerPicker.tsx       # 숫자 입력용 수평 스크롤 룰러
    ├── OnboardingLayout.tsx  # 뒤로가기 화살표 + 진행 바 래퍼
    └── WeekStrip.tsx         # 7일 주간 스트립 (활성 날짜 하이라이트)
```

## 스크린 및 온보딩 흐름

### 온보딩 (10단계)

| 단계 | 스크린 | 입력 방식 | 비고 |
|---|---|---|---|
| 1 | goal | 3개 옵션 필 | 감량 / 유지 / 근육 증량 |
| 2 | gender | 3개 옵션 필 | 남성 / 여성 / 기타 |
| 3 | birthday | 날짜 휠 피커 | TDEE 나이 계산에 사용 |
| 4 | current-weight | 룰러 피커 | 설정 단위에 따라 kg 또는 lbs |
| 5 | height | 룰러 피커 | cm 또는 ft/in |
| 6 | target-weight | 룰러 피커 | 목표 라벨 표시 |
| 7 | activity | 4개 옵션 필 | 비활동적 / 가볍게 / 활동적 / 매우 활동적 |
| 8 | diet | 복수 선택 필 | 없음 / 채식 / 비건 / 키토 / 글루텐프리 |
| 9 | results | 정적 스크린 | 체중 예측 그래프, "사용자의 80%…" 통계 |
| 10 | plan | 편집 가능한 도넛 링 | TDEE 계산 목표, 링별 편집 아이콘 |

마지막 단계에서 "시작하기!" 탭 → `profiles` 테이블 INSERT → MMKV `onboarding_complete = true` → 탭으로 이동

### 메인 앱 탭

| 탭 | 주요 콘텐츠 |
|---|---|
| **홈** | 칼로리 링, 영양소 3개 필, 주간 스트립, 오늘 기록한 음식 목록, FAB "+" |
| **분석** | 체중 추이 선형 차트 (최근 90일), 주간 영양소 막대 차트, BMI, 스트릭 |
| **설정** | 테마 (라이트 / 다크 / 시스템), 단위 (kg/lbs), API 키 입력, 체중 기록 |

## 데이터 모델

### SQLite 테이블 (Drizzle 스키마)

```typescript
profiles        // 단일 행 — 온보딩 완료 시 생성 (목표, 성별, 체중, 키, 칼로리/영양소 목표 등)
dailyLogs       // 날짜별 1행 (YYYY-MM-DD unique), waterMl
foodEntries     // 기록된 모든 음식 항목 (dailyLogId, name, calories, protein, carbs, fat, source, photoUri)
exerciseEntries // 기록된 운동 (dailyLogId, name, durationMinutes, caloriesBurned)
weightLogs      // 체중 추이 차트용 수동 체중 기록
```

### MMKV 키

```
onboarding_complete   — 최초 실행 리다이렉트 게이트 (boolean)
theme                 — 'light' | 'dark' | 'system'
weight_unit           — 'kg' | 'lbs'
gemini_api_key        — 설정에서 사용자가 입력
nutritionix_app_id    — 설정에서 사용자가 입력
nutritionix_api_key   — 설정에서 사용자가 입력
```

### Zustand 스토어

- **profileStore** — 앱 시작 시 `profiles` 테이블에서 하이드레이션; 목표 + 영양소 목표 보관
- **dailyStore** — 홈 화면 포커스마다 오늘의 `dailyLogs`, `foodEntries`, `exerciseEntries`에서 리하이드레이션
- **settingsStore** — MMKV를 직접 읽고 쓴다 (SQLite 없음)

## 핵심 흐름

### AI 음식 사진 스캔

```
"+" FAB → 바텀 시트 (카메라 / 검색 / 운동 / 수분)
→ log/camera.tsx (VisionCamera 전체화면) → 셔터 탭
→ base64 인코딩 → services/gemini.ts 호출
→ Gemini 2.0 Flash: {"name","calories","protein_g","carbs_g","fat_g","serving_size","health_score"}
→ log/scan-result.tsx: 전체화면 사진 헤더, 편집 가능한 필드, 헬스 스코어 바
→ "결과 수정" → 수정 힌트 추가 후 Gemini 재호출
→ "완료" → foodEntries INSERT + dailyLogs UPSERT → dailyStore 업데이트 → 홈으로 복귀
```

### 음식 텍스트 검색

```
log/search.tsx → services/nutritionix.ts
→ Nutritionix /v2/natural/nutrients (자연어 쿼리)
→ 결과 목록 → 항목 탭 → 확인 → DB INSERT
```

## UI 및 컬러 시스템

`.claude/screenshots/` 스크린샷을 기반으로 Cal AI 디자인을 재현한다.

| 토큰 | Hex | 용도 |
|---|---|---|
| bg-primary (라이트) | `#FFFFFF` | 메인 배경 |
| bg-secondary (라이트) | `#F5F5F5` | 카드, 입력 필드 배경 |
| bg-primary (다크) | `#111111` | 다크모드 메인 배경 |
| bg-secondary (다크) | `#1E1E1E` | 다크모드 카드 |
| accent-orange | `#FF5500` | 스트릭 플레임 아이콘, 강조 |
| macro-protein | `#FF6B35` | 단백질 링 / 필 색상 |
| macro-carbs | `#FFB800` | 탄수화물 링 / 필 색상 |
| macro-fat | `#4A9EFF` | 지방 링 / 필 색상 |

**기본 폰트:** Inter (대체: `System, sans-serif`)

**핵심 컴포넌트 패턴:**
- 옵션 필 — 라이트 그레이 배경 → 탭 시 검정 배경 + 흰 텍스트 (`rounded-2xl py-4`)
- 도넛 링 — SVG 원형 진행 바, 영양소 카테고리별 색상
- 룰러 피커 — 눈금이 있는 수평 스크롤뷰, 중앙 핀 값 표시
- 칼로리 링 — 홈 대형 SVG 도넛, 중앙 플레임 아이콘
- FAB "+" — 검정 원형, 우하단, 바텀 시트 기록 창 오픈

## API 연동

### Gemini 2.0 Flash Vision
- **엔드포인트:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **인증:** `?key=GEMINI_API_KEY` (MMKV에서 읽어옴)
- **응답:** `candidates[0].content.parts[0].text`에서 JSON 파싱

### Nutritionix 자연어 영양소
- **엔드포인트:** `https://trackapi.nutritionix.com/v2/natural/nutrients`
- **인증:** `x-app-id` + `x-app-key` 헤더 (MMKV에서 읽어옴)
- **입력:** `{ query: "삶은 달걀 2개와 토스트" }`

두 API 키 모두 설정 화면에서 사용자가 한 번 입력하면 MMKV에 저장된다.

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (Expo Go)
npx expo start

# 캐시 초기화 후 시작
npx expo start --clear

# iOS 시뮬레이터 실행 (VisionCamera 필요 — Expo Go 불가)
npx expo run:ios

# Android 에뮬레이터 실행
npx expo run:android

# 스키마 변경 후 Drizzle 마이그레이션 생성
npx drizzle-kit generate

# 마이그레이션 적용
npx drizzle-kit migrate

# 타입 검사
npx tsc --noEmit

# 린트
npx eslint .

# 전체 테스트
npx jest

# 단일 테스트 파일 실행
npx jest src/utils/tdee.test.ts
```

> **주의:** VisionCamera는 커스텀 네이티브 빌드가 필요하다. 카메라 기능 테스트 시 `npx expo run:ios` / `npx expo run:android` 또는 EAS Build를 사용해야 한다.

---

# Cal AI Clone

A cross-platform mobile clone of [Cal AI](https://www.calai.app/) — an AI-powered calorie tracking app built with React Native (Expo).

Snap a photo of any meal to instantly identify calories and nutrients using AI. The app guides users through a 10-step personalized onboarding, recognizes food via Google Gemini 2.0 Flash Vision API, and searches a food database via Nutritionix. All data is stored locally on-device in SQLite — no backend, no login required.

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Expo Managed Workflow + EAS Build | SDK 55 (RN 0.83) |
| Language | TypeScript (strict mode) | 5.8.x |
| Navigation | Expo Router | ^4.x |
| State | Zustand | ^5.x |
| Styling | NativeWind (Tailwind for RN) | ^4.1.x |
| Camera | react-native-vision-camera | ^4.7.x |
| AI Food Recognition | Google Gemini 2.0 Flash Vision API | REST |
| Food Text Search | Nutritionix API | REST |
| Local DB | expo-sqlite + Drizzle ORM | sqlite ~15.x, drizzle ^0.40.x |
| Key-Value Store | react-native-mmkv | ^4.3.x |
| Charts | react-native-gifted-charts | latest |
| Notifications | expo-notifications | ~0.31.x |
| Testing | Jest + React Native Testing Library | ^30.x / ^13.x |

## Project Structure

```
app/
├── _layout.tsx              # Root: fonts, theme provider, DB init, MMKV gate
├── index.tsx                # Router gate → redirect to onboarding or tabs
├── onboarding/              # Stack with no tab bar — entry point for first-time users
│   ├── goal.tsx             # Goal selection (lose / maintain / gain)
│   ├── gender.tsx           # Gender selection
│   ├── birthday.tsx         # Birthday input
│   ├── current-weight.tsx   # Current weight (ruler picker)
│   ├── height.tsx           # Height (ruler picker)
│   ├── target-weight.tsx    # Target weight (ruler picker)
│   ├── activity.tsx         # Activity level (4 options)
│   ├── diet.tsx             # Dietary preferences (multi-select pills)
│   ├── results.tsx          # "Cal AI creates long-term results" + projection graph
│   └── plan.tsx             # Generated plan with 4 editable macro donut rings
├── (tabs)/                  # Bottom tab bar: Home | Analytics | Settings
│   ├── index.tsx            # Home dashboard
│   ├── analytics.tsx        # Weight trend + macro history charts
│   └── settings.tsx         # Theme, units, API key configuration
└── log/                     # Food logging modal screens pushed over the tab bar
    ├── camera.tsx           # VisionCamera fullscreen capture
    ├── scan-result.tsx      # Gemini result — editable fields + confirm
    ├── search.tsx           # Nutritionix text search
    ├── exercise.tsx         # Log workout (name, duration, kcal burned)
    └── water.tsx            # Log water intake

src/
├── db/
│   ├── schema.ts            # Drizzle table definitions
│   ├── index.ts             # expo-sqlite connection + drizzle instance
│   └── migrations/          # Auto-generated by drizzle-kit
├── stores/
│   ├── profileStore.ts      # User profile + macro goals
│   ├── dailyStore.ts        # Today's entries, consumed totals, water, exercise
│   └── settingsStore.ts     # Theme + units (backed by MMKV)
├── services/
│   ├── gemini.ts            # Gemini 2.0 Flash Vision API calls
│   └── nutritionix.ts       # Food text search API calls
├── utils/
│   ├── tdee.ts              # Mifflin-St Jeor TDEE + macro calculation
│   ├── streaks.ts           # Consecutive day streak logic
│   └── units.ts             # kg↔lbs, cm↔ft/in conversions
└── components/
    ├── CalorieRing.tsx       # SVG circular progress ring
    ├── MacroPill.tsx         # Protein / Carbs / Fat remaining pill
    ├── FoodEntryCard.tsx     # Food log item card with photo thumbnail
    ├── RulerPicker.tsx       # Horizontal scroll ruler for numeric input
    ├── OnboardingLayout.tsx  # Back arrow + progress bar wrapper
    └── WeekStrip.tsx         # 7-day strip with active day highlight
```

## Screens & Onboarding Flow

### Onboarding (10 Steps)

| Step | Screen | Input Type | Notes |
|---|---|---|---|
| 1 | goal | 3 option pills | Lose weight / Maintain / Gain muscle |
| 2 | gender | 3 option pills | Male / Female / Other |
| 3 | birthday | date wheel picker | Used for TDEE age calculation |
| 4 | current-weight | ruler picker | kg or lbs based on settings |
| 5 | height | ruler picker | cm or ft/in |
| 6 | target-weight | ruler picker | Shows goal label above value |
| 7 | activity | 4 option pills | Sedentary / Lightly active / Active / Very active |
| 8 | diet | multi-select pills | None / Vegetarian / Vegan / Keto / Gluten-free |
| 9 | results | static screen | Weight projection graph, "80% of users…" stat |
| 10 | plan | editable donut rings | TDEE-calculated goals, pencil edit icon per ring |

Final step "Let's get started!" → `INSERT INTO profiles` → MMKV `onboarding_complete = true` → navigate to tabs.

### Main App Tabs

| Tab | Key Content |
|---|---|
| **Home** | Calorie ring, 3 macro pills, week strip, today's food log, FAB "+" |
| **Analytics** | Weight trend line chart (last 90 days), weekly macro bar chart, BMI, streak |
| **Settings** | Theme (light / dark / system), units (kg / lbs), API key input, weight logging |

## Data Model

### SQLite Tables (Drizzle Schema)

```typescript
profiles        // Single row — created at end of onboarding (goal, gender, weight, height, calorie/macro goals)
dailyLogs       // One row per calendar day (YYYY-MM-DD unique), waterMl
foodEntries     // Every logged food item (dailyLogId, name, calories, protein, carbs, fat, source, photoUri)
exerciseEntries // Logged workouts (dailyLogId, name, durationMinutes, caloriesBurned)
weightLogs      // Manual weight entries for the trend chart
```

### MMKV Keys

```
onboarding_complete   — first-launch redirect gate (boolean)
theme                 — 'light' | 'dark' | 'system'
weight_unit           — 'kg' | 'lbs'
gemini_api_key        — entered by user in Settings
nutritionix_app_id    — entered by user in Settings
nutritionix_api_key   — entered by user in Settings
```

### Zustand Stores

- **profileStore** — hydrated from `profiles` table at app start; holds goals + macro targets
- **dailyStore** — rehydrated from today's `dailyLogs`, `foodEntries`, `exerciseEntries` on every home screen focus
- **settingsStore** — reads/writes MMKV directly (no SQLite)

## Key Flows

### AI Food Photo Scan

```
"+" FAB → bottom sheet (Camera / Search / Exercise / Water)
→ log/camera.tsx (VisionCamera fullscreen) → tap shutter
→ base64 encode → services/gemini.ts
→ Gemini 2.0 Flash: {"name","calories","protein_g","carbs_g","fat_g","serving_size","health_score"}
→ log/scan-result.tsx: full-bleed photo header, editable fields, health score bar
→ "Fix Results" → re-call Gemini with user's correction hint
→ "Done" → foodEntries INSERT + dailyLogs UPSERT → dailyStore update → back to home
```

### Food Text Search

```
log/search.tsx → services/nutritionix.ts
→ Nutritionix /v2/natural/nutrients (natural language query)
→ results list → tap item → confirm → DB INSERT
```

## UI & Color System

UI is matched to Cal AI screenshots in `.claude/screenshots/`.

| Token | Hex | Usage |
|---|---|---|
| bg-primary (light) | `#FFFFFF` | Main background |
| bg-secondary (light) | `#F5F5F5` | Cards, input backgrounds |
| bg-primary (dark) | `#111111` | Dark mode main background |
| bg-secondary (dark) | `#1E1E1E` | Dark mode cards |
| accent-orange | `#FF5500` | Streak flame icon, highlights |
| macro-protein | `#FF6B35` | Protein ring / pill color |
| macro-carbs | `#FFB800` | Carbs ring / pill color |
| macro-fat | `#4A9EFF` | Fat ring / pill color |

**Primary font:** Inter (fallback: `System, sans-serif`)

**Key component patterns:**
- Option pill — light gray bg → taps to black bg + white text (`rounded-2xl py-4`)
- Donut ring — SVG circular progress, color per macro category
- Ruler picker — horizontal `ScrollView` with tick marks, center-pinned value
- Calorie ring — large SVG donut on home screen, flame icon in center
- FAB "+" — black circle, bottom-right, opens bottom sheet logger

## API Integration

### Gemini 2.0 Flash Vision
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Auth:** `?key=GEMINI_API_KEY` (read from MMKV)
- **Response:** JSON parsed from `candidates[0].content.parts[0].text`

### Nutritionix Natural Language
- **Endpoint:** `https://trackapi.nutritionix.com/v2/natural/nutrients`
- **Auth:** `x-app-id` + `x-app-key` headers (read from MMKV)
- **Input:** `{ query: "2 boiled eggs and toast" }`

Both API keys are entered once by the user in Settings and stored in MMKV.

## Development

```bash
# Install dependencies
npm install

# Start dev server (Expo Go)
npx expo start

# Start with cache cleared
npx expo start --clear

# Run on iOS simulator (VisionCamera requires native build — not Expo Go)
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
```

> **Note:** VisionCamera requires a custom native build. Use `npx expo run:ios` / `npx expo run:android` or EAS Build for any camera-related testing — it does not work in Expo Go.
