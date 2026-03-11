# Bug Fixes & Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all identified bugs, extract shared hold-to-complete logic, and improve code quality across the habit tracking app.

**Architecture:** Fix bugs in-place, extract a `useHoldToComplete` hook to deduplicate ~400 lines across 5 card components, switch TimedHabitCard from RNGH Pressable to RN Pressable with manual timer to fix ScrollView gesture conflict, and add real-time partner profile sync.

**Tech Stack:** React Native, Reanimated, RNGH, Firebase Firestore, TypeScript

---

## Chunk 1: Critical Bug Fixes

### Task 1: Fix ProgressBar withSpring on string

The `ProgressBar` passes a percentage string to `withSpring()`, which only accepts numbers. The animation silently fails.

**Files:**
- Modify: `src/components/ui/ProgressBar.tsx`

- [ ] **Step 1: Fix ProgressBar to use numeric shared value**

Replace the current implementation with a proper Reanimated approach using `useSharedValue` and `useEffect` to drive the animation:

```tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, color, height = 8, style }: ProgressBarProps) {
  const { colors } = useTheme();
  const fillColor = color ?? colors.success;
  const clamped = Math.min(1, Math.max(0, progress));
  const widthProgress = useSharedValue(clamped);

  useEffect(() => {
    widthProgress.value = withSpring(clamped, { damping: 15, stiffness: 120 });
  }, [clamped]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.border }, style]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: fillColor, borderRadius: height / 2 }, animatedStyle]}
      />
    </View>
  );
}
```

- [ ] **Step 2: Verify no other components use ProgressBar incorrectly**

Grep for `ProgressBar` usage. Only used in `app/(tabs)/index.tsx` — no changes needed there.

---

### Task 2: Fix ProgressiveHabitCard undo logic

When undoing a completed progressive habit, the code uses `target - increment` instead of `localValue - increment`, jumping the value incorrectly.

**Files:**
- Modify: `src/components/habits/ProgressiveHabitCard.tsx:96`

- [ ] **Step 1: Fix the undo value calculation**

Change line 96 from:
```tsx
const undoValue = Math.max(0, target - increment);
```
to:
```tsx
const undoValue = Math.max(0, localValue - increment);
```

---

### Task 3: Fix PartnerHabitRow hardcoded reading target

Line 25 hardcodes "10 pages" instead of using `READING_TARGET_PAGES`.

**Files:**
- Modify: `src/components/partner/PartnerHabitRow.tsx:1,25`

- [ ] **Step 1: Import and use the constant**

Add import:
```tsx
import { READING_TARGET_PAGES } from '../../config/habits';
```

Change line 25 from:
```tsx
detail = `${readingData.pagesRead}/10 pages`;
```
to:
```tsx
detail = `${readingData.pagesRead}/${READING_TARGET_PAGES} pages`;
```

---

### Task 4: Fix TimedHabitCard View inside SVG

A React Native `View` is nested inside an `Svg` component. This doesn't render — the icon is invisible.

**Files:**
- Modify: `src/components/habits/TimedHabitCard.tsx:210-251`

- [ ] **Step 1: Move icon outside SVG with absolute positioning**

Replace the SVG block (lines 212-237) with SVG only containing circles, and the icon positioned absolutely over the SVG:

```tsx
{running ? (
  <View style={{ width: RING_SIZE, height: RING_SIZE }}>
    <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        stroke={colors.border}
        strokeWidth={RING_STROKE}
        fill={`${definition.color}1A`}
      />
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        stroke={definition.color}
        strokeWidth={RING_STROKE}
        fill="none"
        strokeDasharray={`${CIRCUMFERENCE}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
      />
    </Svg>
    <View style={styles.iconOverRing}>
      <HabitIcon name={definition.icon} size={20} color={definition.color} />
    </View>
  </View>
) : (
  // ... existing non-running icon
)}
```

---

### Task 5: Fix CelebrationOverlay missing useEffect dependency

`onDismiss` is used inside the useEffect but not listed in the dependency array, causing a stale closure. Also increase auto-dismiss to 4s.

**Files:**
- Modify: `src/components/ui/CelebrationOverlay.tsx:24-36`

- [ ] **Step 1: Add onDismiss to dependency array and increase timeout**

Change the useEffect:
```tsx
useEffect(() => {
  if (visible) {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  } else {
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.5, { duration: 200 });
  }
}, [visible, onDismiss]);
```

---

### Task 6: Fix DualRingHero hardcoded HABIT_LABELS

Replace hardcoded array with dynamic lookup from habit config.

**Files:**
- Modify: `src/components/stats/DualRingHero.tsx:6,22`

- [ ] **Step 1: Replace hardcoded HABIT_LABELS**

Add to existing import on line 6:
```tsx
import { HABIT_ORDER, getHabitDefinition } from '../../config/habits';
```

Remove line 22 (`const HABIT_LABELS = [...]`) and update the tooltip text (line 237) from:
```tsx
{HABIT_LABELS[selectedHabit] ?? 'Habit'}
```
to:
```tsx
{HABIT_ORDER[selectedHabit] ? getHabitDefinition(HABIT_ORDER[selectedHabit]).shortLabel : 'Habit'}
```

---

### Task 7: Fix debounce timer cleanup in useHabits

Debounce timers for water/reading don't clean up on unmount.

**Files:**
- Modify: `src/hooks/useHabits.ts:23-42`

- [ ] **Step 1: Add cleanup effect**

After the existing useEffect (line 23-42), add:
```tsx
useEffect(() => {
  return () => {
    Object.values(debounceTimers.current).forEach((t) => clearTimeout(t));
  };
}, []);
```

---

## Chunk 2: Fix TimedHabitCard Hold-to-Complete (Bina's Bug)

### Task 8: Fix TimedHabitCard hold-to-complete gesture

The TimedHabitCard uses RNGH's `Pressable` with `onLongPress`, which conflicts with the parent ScrollView. The fill animation starts but the ScrollView steals the touch, firing `onPressOut` early and resetting the fill. Switch to RN's built-in `Pressable` with a manual `setTimeout` (same pattern as BinaryHabitCard which works correctly).

**Files:**
- Modify: `src/components/habits/TimedHabitCard.tsx`

- [ ] **Step 1: Switch Pressable import from RNGH to React Native**

Change line 3 from:
```tsx
import { Pressable } from 'react-native-gesture-handler';
```
to removing that import and adding Pressable to the RN import on line 2:
```tsx
import { View, Text, StyleSheet, AppState, Pressable } from 'react-native';
```

- [ ] **Step 2: Add manual timer refs**

Add refs after `fillProgress` and `cardScale` (after line 46):
```tsx
const holdTimer = useRef<NodeJS.Timeout | null>(null);
const isHolding = useRef(false);
const justCompleted = useRef(false);
```

- [ ] **Step 3: Replace handleLongPress with triggerComplete**

Replace `handleLongPress` (lines 132-151) with:
```tsx
const triggerComplete = useCallback(() => {
  justCompleted.current = true;
  // Clean up timer if it was running
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  startedAtRef.current = null;
  setRunning(false);
  if (notifIdRef.current) {
    Notifications.cancelScheduledNotificationAsync(notifIdRef.current);
    notifIdRef.current = null;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  onToggle();
  fillProgress.value = withTiming(0, { duration: 200 });
  cardScale.value = withSpring(1);
}, [completed, onToggle]);
```

- [ ] **Step 4: Replace handlePressIn with timer-based version**

Replace `handlePressIn` (lines 153-160) with:
```tsx
const handlePressIn = useCallback(() => {
  if (completed) return;
  isHolding.current = true;
  cardScale.value = withTiming(0.97, { duration: 100 });
  fillProgress.value = withTiming(1, { duration: HOLD_DURATION });

  holdTimer.current = setTimeout(() => {
    if (isHolding.current) {
      runOnJS(triggerComplete)();
    }
  }, HOLD_DURATION);
}, [completed, triggerComplete]);
```

- [ ] **Step 5: Replace handlePressOut with timer cleanup**

Replace `handlePressOut` (lines 162-167) with:
```tsx
const handlePressOut = useCallback(() => {
  isHolding.current = false;
  if (holdTimer.current) {
    clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }
  if (!completed) {
    fillProgress.value = withTiming(0, { duration: 150 });
  }
  cardScale.value = withSpring(1);
}, [completed]);
```

- [ ] **Step 6: Update handlePress to handle justCompleted guard**

Replace `handlePress` (lines 169-177) with:
```tsx
const handlePress = useCallback(() => {
  if (justCompleted.current) {
    justCompleted.current = false;
    return;
  }
  if (completed) {
    // Undo
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  } else if (!running) {
    handleStart();
  }
}, [completed, running, handleStart, onToggle]);
```

- [ ] **Step 7: Remove onLongPress and delayLongPress from Pressable**

Change the Pressable (lines 192-198) from:
```tsx
<Pressable
  onPress={handlePress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  onLongPress={handleLongPress}
  delayLongPress={HOLD_DURATION}
>
```
to:
```tsx
<Pressable
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  onPress={handlePress}
>
```

- [ ] **Step 8: Add runOnJS import**

Add `runOnJS` to the reanimated imports on line 4-8.

---

## Chunk 3: Extract useHoldToComplete Hook

### Task 9: Create useHoldToComplete hook

Extract the duplicated hold-to-complete logic from BinaryHabitCard, ProgressiveHabitCard, WorkoutHabitCard, TimedHabitCard, and PersonalHabitCard into a shared hook.

**Files:**
- Create: `src/hooks/useHoldToComplete.ts`
- Modify: `src/components/habits/BinaryHabitCard.tsx`
- Modify: `src/components/habits/ProgressiveHabitCard.tsx`
- Modify: `src/components/habits/WorkoutHabitCard.tsx`
- Modify: `src/components/habits/TimedHabitCard.tsx`
- Modify: `src/components/habits/PersonalHabitCard.tsx`

- [ ] **Step 1: Create the useHoldToComplete hook**

```tsx
// src/hooks/useHoldToComplete.ts
import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const HOLD_DURATION = 500;

interface UseHoldToCompleteOptions {
  completed: boolean;
  onComplete: () => void;
  color: string;
}

interface UseHoldToCompleteResult {
  fillProgress: SharedValue<number>;
  cardScale: SharedValue<number>;
  fillStyle: { width: string; backgroundColor: string };
  cardAnimStyle: { transform: { scale: number }[] };
  pressHandlers: {
    onPressIn: () => void;
    onPressOut: () => void;
    onPress: () => void;
  };
}

export function useHoldToComplete({
  completed,
  onComplete,
  color,
}: UseHoldToCompleteOptions) {
  const fillProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const isHolding = useRef(false);
  const justCompleted = useRef(false);

  const triggerComplete = useCallback(() => {
    justCompleted.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
    fillProgress.value = withTiming(0, { duration: 200 });
    cardScale.value = withSpring(1);
  }, [onComplete]);

  const onPressIn = useCallback(() => {
    if (completed) return;
    isHolding.current = true;
    cardScale.value = withTiming(0.97, { duration: 100 });
    fillProgress.value = withTiming(1, { duration: HOLD_DURATION });

    holdTimer.current = setTimeout(() => {
      if (isHolding.current) {
        runOnJS(triggerComplete)();
      }
    }, HOLD_DURATION);
  }, [completed, triggerComplete]);

  const onPressOut = useCallback(() => {
    isHolding.current = false;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (!completed) {
      fillProgress.value = withTiming(0, { duration: 150 });
    }
    cardScale.value = withSpring(1);
  }, [completed]);

  const onPress = useCallback(() => {
    if (justCompleted.current) {
      justCompleted.current = false;
      return;
    }
    if (completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onComplete();
    }
  }, [completed, onComplete]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
    backgroundColor: `${color}26`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return {
    fillProgress,
    cardScale,
    fillStyle,
    cardAnimStyle,
    pressHandlers: { onPressIn, onPressOut, onPress },
  };
}
```

- [ ] **Step 2: Refactor BinaryHabitCard to use hook**

Replace all the hold logic (~50 lines) with:
```tsx
const { fillStyle, cardAnimStyle, pressHandlers } = useHoldToComplete({
  completed,
  onComplete: onToggle,
  color: definition.color,
});
```

Remove: `holdTimer`, `isHolding`, `justCompleted` refs, `triggerComplete`, `handlePressIn`, `handlePressOut`, `handleTap`, `fillStyle`, `cardAnimStyle`, and the `fillProgress`/`cardScale` shared values.

Use `pressHandlers` on the Pressable:
```tsx
<Pressable {...pressHandlers}>
```

- [ ] **Step 3: Refactor PersonalHabitCard to use hook**

Same pattern. Switch import from RNGH Pressable to RN Pressable. Use the hook.

- [ ] **Step 4: Refactor ProgressiveHabitCard to use hook**

For ProgressiveHabitCard, the `onComplete` sets value to target:
```tsx
const { fillStyle, cardAnimStyle, pressHandlers } = useHoldToComplete({
  completed: data.completed,
  onComplete: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLocalValue(target);
    onUpdate(target);
  },
  color: definition.color,
});
```

Override `pressHandlers.onPress` for the custom undo logic (decrement from localValue, not target).

- [ ] **Step 5: Refactor WorkoutHabitCard to use hook**

The WorkoutHabitCard's `onComplete` opens the note modal instead of toggling directly:
```tsx
const { fillStyle, cardAnimStyle, pressHandlers } = useHoldToComplete({
  completed,
  onComplete: () => setShowNoteModal(true),
  color: definition.color,
});
```

Override `pressHandlers.onPress` so undo calls `onToggle` directly.

- [ ] **Step 6: Refactor TimedHabitCard to use hook**

TimedHabitCard's `onComplete` also needs to clean up the running timer:
```tsx
const { fillStyle, cardAnimStyle, pressHandlers: holdHandlers } = useHoldToComplete({
  completed,
  onComplete: () => {
    // Clean up running timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startedAtRef.current = null;
    setRunning(false);
    if (notifIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(notifIdRef.current);
      notifIdRef.current = null;
    }
    onToggle();
  },
  color: definition.color,
});
```

Override `pressHandlers.onPress` to start timer on tap when not running.

---

## Chunk 4: Partner Profile Real-time Sync & Cleanup

### Task 10: Make partner profile real-time

Switch from `.get()` to `onSnapshot()` for partner profile in useAuth.

**Files:**
- Modify: `src/hooks/useAuth.ts:32-42`

- [ ] **Step 1: Replace .get() with onSnapshot for partner profile**

```tsx
useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
    setUser(firebaseUser);

    if (!firebaseUser) {
      setProfile(null);
      setPartnerProfile(null);
      setIsLoading(false);
      return;
    }

    let partnerUnsub: (() => void) | null = null;

    const profileUnsub = firestore()
      .collection('users')
      .doc(firebaseUser.uid)
      .onSnapshot((snapshot) => {
        if (snapshot.exists()) {
          const userProfile = snapshot.data() as UserProfile;
          setProfile(userProfile);

          if (userProfile.partnerId) {
            // Clean up previous partner listener if partnerId changed
            if (partnerUnsub) partnerUnsub();
            partnerUnsub = firestore()
              .collection('users')
              .doc(userProfile.partnerId)
              .onSnapshot((partnerDoc) => {
                if (partnerDoc.exists()) {
                  setPartnerProfile(partnerDoc.data() as UserProfile);
                }
              });
          }
        }
        setIsLoading(false);
      });

    return () => {
      profileUnsub();
      if (partnerUnsub) partnerUnsub();
    };
  });

  return () => unsubscribe();
}, []);
```

---

### Task 11: Commit all changes

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "fix: critical bug fixes, extract useHoldToComplete hook, real-time partner sync"
```
