import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, AppState } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import Svg, { Circle } from 'react-native-svg';
import { PersonalHabitDefinition, HabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface TimedHabitCardProps {
  definition: PersonalHabitDefinition;
  data: HabitData | undefined;
  onToggle: () => void;
}

const RING_SIZE = 48;
const RING_RADIUS = 20;
const RING_STROKE = 3;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TimedHabitCard({ definition, data, onToggle }: TimedHabitCardProps) {
  const completed = data?.completed ?? false;
  const duration = definition.durationSeconds ?? 300;

  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(duration);
  const startedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifIdRef = useRef<string | null>(null);
  const cardScale = useSharedValue(1);

  // Tick the timer
  const tick = useCallback(() => {
    if (!startedAtRef.current) return;
    const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
    const left = Math.max(0, duration - elapsed);
    setRemaining(left);
    if (left <= 0) {
      // Timer done
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startedAtRef.current = null;
      setRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onToggle();
      // Cancel the notification since we completed in-app
      if (notifIdRef.current) {
        Notifications.cancelScheduledNotificationAsync(notifIdRef.current);
        notifIdRef.current = null;
      }
    }
  }, [duration, onToggle]);

  // Recalculate on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && startedAtRef.current) {
        tick();
      }
    });
    return () => sub.remove();
  }, [tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (notifIdRef.current) {
        Notifications.cancelScheduledNotificationAsync(notifIdRef.current);
      }
    };
  }, []);

  // If data resets to not-completed while not running, reset to idle
  useEffect(() => {
    if (!completed && !running) {
      setRemaining(duration);
    }
  }, [completed, running, duration]);

  const handleStart = useCallback(async () => {
    if (completed || running) return;
    const now = Date.now();
    startedAtRef.current = now;
    setRunning(true);
    setRemaining(duration);

    // Start interval
    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Schedule local notification for when timer completes
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${definition.label} done!`,
          body: 'Your timer has finished.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: duration,
        },
      });
      notifIdRef.current = id;
    } catch {
      // Notifications may not be permitted — timer still works
    }
  }, [completed, running, duration, tick, definition.label]);

  const handleTap = useCallback(() => {
    if (completed) {
      // Undo
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle();
    } else if (!running) {
      handleStart();
    }
  }, [completed, running, handleStart, onToggle]);

  const handlePressIn = useCallback(() => {
    cardScale.value = withSpring(0.97);
  }, []);

  const handlePressOut = useCallback(() => {
    cardScale.value = withSpring(1);
  }, []);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const progress = running ? (duration - remaining) / duration : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <Pressable
      onPress={handleTap}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          completed && styles.cardCompleted,
          cardAnimStyle,
        ]}
      >
        <View style={styles.row}>
          {/* Icon with optional progress ring */}
          <View style={styles.iconWrapper}>
            {running ? (
              <Svg width={RING_SIZE} height={RING_SIZE}>
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
                <View style={styles.iconOverRing}>
                  <HabitIcon name={definition.icon} size={20} color={definition.color} />
                </View>
              </Svg>
            ) : (
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${definition.color}1A` },
                ]}
              >
                <HabitIcon
                  name={definition.icon}
                  size={22}
                  color={definition.color}
                />
              </View>
            )}
          </View>

          {/* Text */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                completed && styles.labelCompleted,
              ]}
            >
              {definition.label}
            </Text>
            {running ? (
              <Text style={[styles.countdown, { color: definition.color }]}>
                {formatTime(remaining)}
              </Text>
            ) : (
              <Text style={styles.description}>
                {completed ? 'Personal' : 'Tap to start timer'}
              </Text>
            )}
          </View>

          {/* Right side */}
          {completed && (
            <>
              <Text style={styles.undoLabel}>Undo</Text>
              <View
                style={[styles.checkmark, { backgroundColor: definition.color }]}
              >
                <HabitIcon name="checkmark" size={16} color="#fff" />
              </View>
            </>
          )}
          {running && (
            <View style={[styles.timerBadge, { backgroundColor: `${definition.color}1A` }]}>
              <Text style={[styles.timerBadgeText, { color: definition.color }]}>
                {formatTime(remaining)}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCompleted: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  description: {
    ...typography.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  countdown: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    marginTop: 2,
  },
  undoLabel: {
    ...typography.xs,
    color: colors.textTertiary,
    marginRight: spacing.xs,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  timerBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  timerBadgeText: {
    ...typography.md,
    fontWeight: fontWeights.bold,
  },
});
