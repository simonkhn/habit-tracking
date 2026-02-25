# 75-Day Challenge - Habit Tracking App

A two-person habit tracking app for a 75-day challenge (in 25-day chunks). Simon and Bina track 6 daily habits and see each other's progress in real-time with push notifications.

## Tech Stack

- **Runtime:** React Native + Expo SDK 54, TypeScript
- **Routing:** Expo Router (file-based, `app/` directory)
- **Backend:** Firebase (Firestore, Auth, Cloud Functions, FCM)
- **Native Firebase:** `@react-native-firebase/app`, `auth`, `firestore` (requires custom dev client, not Expo Go)
- **State:** Zustand (auth state), Firestore `onSnapshot` (habit data)
- **Animations:** `react-native-reanimated` + `expo-haptics`
- **Charts:** `react-native-svg` (heatmap, completion ring)
- **Notifications:** `expo-notifications` + Expo Push API
- **Build:** EAS Build (Android APK) + EAS Update (OTA for JS-only changes)

## Project Structure

```
app/                          # Expo Router file-based routing
├── _layout.tsx               # Root layout: auth gate, providers, gesture handler
├── (auth)/
│   ├── _layout.tsx           # Stack navigator for auth screens
│   ├── login.tsx
│   └── signup.tsx
└── (tabs)/
    ├── _layout.tsx           # Tab navigator: Today, Partner, Stats, Settings
    ├── index.tsx             # Today screen (main habit interaction)
    ├── partner.tsx           # Partner's habits (read-only, real-time)
    ├── stats.tsx             # Heatmap, streaks, completion rates
    └── settings.tsx          # Profile, notification toggles, sign out

src/
├── components/
│   ├── habits/
│   │   ├── HabitCard.tsx             # Dispatcher: routes to correct card type
│   │   ├── BinaryHabitCard.tsx       # Press-and-hold (0.5s) with fill animation
│   │   ├── ProgressiveHabitCard.tsx  # Water/Reading with +/- stepper
│   │   ├── JournalHabitCard.tsx      # Expandable text input with validation
│   │   ├── WaterFillVisual.tsx       # Animated water fill bar
│   │   └── HabitIcon.tsx             # Ionicons wrapper
│   ├── partner/
│   │   ├── PartnerSummaryCard.tsx    # Colored dots summary on Today screen
│   │   └── PartnerHabitRow.tsx       # Single habit row for Partner screen
│   ├── stats/
│   │   ├── HeatmapGrid.tsx           # GitHub-style SVG heatmap (90 days)
│   │   ├── StreakCounter.tsx          # Per-habit streak card
│   │   ├── CompletionRateChart.tsx   # SVG circular ring chart
│   │   └── DayCounter.tsx            # "Day X of 75" hero
│   └── ui/
│       ├── Button.tsx                # Primary/secondary/ghost variants
│       ├── Card.tsx                  # Base card with border
│       ├── ScreenContainer.tsx       # SafeAreaView + ScrollView wrapper
│       ├── CelebrationOverlay.tsx    # "All done!" overlay (auto-dismiss 3s)
│       └── ProgressBar.tsx           # Animated fill bar
├── config/
│   ├── firebase.ts            # Firebase imports (auto-init via native config)
│   └── habits.ts              # Habit definitions, colors, order, defaults
├── hooks/
│   ├── useAuth.ts             # Firebase auth listener + profile subscription
│   ├── useHabits.ts           # Today's habits: read + mutations (debounced)
│   ├── usePartnerHabits.ts    # Partner's habits via onSnapshot
│   ├── useStats.ts            # Historical data: batch query last 90 days
│   └── useNotifications.ts    # Push token registration + local scheduling
├── services/
│   ├── auth.ts                # signIn, signUp, signOut, profile CRUD
│   ├── firestore.ts           # Habit log CRUD, journal entries, subscriptions
│   └── notifications.ts       # Push registration, local reminders, handler
├── stores/
│   └── authStore.ts           # Zustand: user, profile, partnerProfile, loading
├── theme/
│   ├── colors.ts              # Background, text, habit colors, heatmap levels
│   ├── typography.ts          # Font sizes (xs-xxl), weights
│   ├── spacing.ts             # 4px grid spacing, border radii
│   └── index.ts               # Re-exports
├── types/
│   ├── habit.ts               # HabitId, HabitLog, DayHabits, per-habit data types
│   ├── user.ts                # UserProfile, NotificationPreferences
│   └── stats.ts               # DayStats, HabitStreak, OverallStats
└── utils/
    ├── dates.ts               # Date formatting, day number calc, log ID generation
    ├── streaks.ts             # Streak calculation, completion rate, day count
    └── validation.ts          # Journal entry, email, time validation

functions/                     # Firebase Cloud Functions (separate package)
├── src/
│   ├── index.ts               # Exports both functions
│   ├── onHabitComplete.ts     # Firestore trigger: notify partner on habit completion
│   └── eveningNudge.ts        # Scheduled 9pm: remind users with incomplete habits
├── package.json
└── tsconfig.json
```

## Data Model (Firestore)

### `users/{userId}`
User profile. Partner reads allowed via `partnerId` lookup.
```
uid, email, displayName ("Simon"|"Bina"), partnerId, wakeUpTime,
waterTargetOz, challengeStartDate, expoPushToken, notificationPreferences
```

### `habitLogs/{userId}_{YYYY-MM-DD}`
One document per user per day. Partner can read. Composite ID for direct lookups.
```
userId, date, updatedAt, habits: {
  wakeUpOnTime:    { completed, completedAt }
  morningSunlight: { completed, completedAt }
  water:           { completed, completedAt, currentOz }
  journal:         { completed, completedAt }        // text stored separately
  reading:         { completed, completedAt, pagesRead }
  workout:         { completed, completedAt }
}
```

### `journalEntries/{userId}_{YYYY-MM-DD}`
Private. Only the author can read/write. Partner has zero access.
```
userId, date, text, updatedAt
```

### Firestore Index
Composite index on `habitLogs`: `userId` ASC + `date` DESC (for stats queries).

## Habits

| Habit | Type | Color | Target |
|-------|------|-------|--------|
| Wake Up On Time | binary | `#E67E22` | Honor system |
| Morning Sunlight | binary | `#F5A623` | Honor system |
| Water | progressive | `#3498DB` | Bina: 65oz, Simon: 80oz (+8oz/tap) |
| Journal | journal | `#9B59B6` | 10+ chars, ends with . ! or ? |
| Read | progressive | `#27AE60` | 10+ pages (+1/tap) |
| Workout | binary | `#E74C3C` | 30+ min, honor system |

Order: morning-to-evening flow.

## Key Patterns

- **Auth gate:** Root `_layout.tsx` listens to `onAuthStateChanged`, redirects to `(auth)` or `(tabs)`.
- **Real-time sync:** All habit data uses Firestore `onSnapshot` listeners, not polling.
- **Debounced writes:** Progressive habits (water, reading) debounce Firestore updates by 300ms.
- **Hold-to-complete:** Binary habits require 0.5s press-and-hold with animated fill + haptic feedback.
- **Celebration:** When all 6 habits completed, overlay auto-fires and auto-dismisses in 3s.
- **Completed habits sink:** Today screen sorts completed habits to the bottom with reduced opacity.
- **Journal privacy:** Text stored in separate collection; habit log only records completed boolean.

## Build & Deploy

```bash
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Build production APK (only needed when native deps change)
eas build --platform android --profile production

# Push JS-only changes OTA (no rebuild needed)
eas update --channel production --message "description of changes"

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
cd functions && npm install && npm run build && firebase deploy --only functions
```

### OTA Updates (EAS Update)
- **JS-only changes** (TypeScript, components, styles, hooks, etc.) can be pushed over the air via `eas update` — no APK rebuild or reinstall needed.
- **Native changes** (adding/removing native libraries, updating Expo SDK, changing `app.config.js` native settings like plugins) require a full `eas build` + APK reinstall.
- Config: `expo-updates` is installed, `app.config.js` has `runtimeVersion` (appVersion policy) and `updates.url` pointing to EAS. Each build profile in `eas.json` has a `channel` (development/preview/production).
- The app checks for updates on launch and downloads them automatically.

### Environment Setup
- `google-services.json` in project root (gitignored, uploaded as EAS secret `GOOGLE_SERVICES_JSON`)
- `app.config.js` dynamically resolves the google-services file path for EAS builds
- `.npmrc` has `legacy-peer-deps=true` (required for `@react-native-firebase` peer dep resolution)

### EAS Profiles
- `development`: Dev client with dev menu (requires `npx expo start`), channel: `development`
- `preview`: Standalone APK for testing, channel: `preview`
- `production`: Standalone APK for daily use, channel: `production`

## Firebase Project
- Project: `habit-tracker-25cfa`
- Auth: Email/Password
- Firestore: nam5 (US multi-region)
- EAS Project ID: `83d8b2dc-e996-4fad-aaa1-aabdf11391b6`
- EAS Owner: `simonsaysbuild`

## Partner Linking
After both users create accounts, manually set each user's `partnerId` field in Firestore Console to the other user's UID.
