import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HabitDefinition, WaterHabitData, ReadingHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { WATER_INCREMENT_OZ, READING_TARGET_PAGES } from '../../config/habits';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

const HOLD_DURATION = 500;

interface ProgressiveHabitCardProps {
  definition: HabitDefinition;
  data: WaterHabitData | ReadingHabitData;
  onUpdate: (newValue: number) => void;
}

export function ProgressiveHabitCard({
  definition,
  data,
  onUpdate,
}: ProgressiveHabitCardProps) {
  const { profile } = useAuthStore();
  const isWater = definition.id === 'water';

  const currentValue = isWater
    ? (data as WaterHabitData).currentOz
    : (data as ReadingHabitData).pagesRead;

  const [localValue, setLocalValue] = useState(currentValue);

  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  const target = isWater ? (profile?.waterTargetOz ?? 80) : READING_TARGET_PAGES;
  const increment = isWater ? WATER_INCREMENT_OZ : 1;
  const unit = isWater ? 'oz' : 'pages';
  const progress = target > 0 ? Math.min(localValue / target, 1) : 0;

  const fillProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const isHolding = useRef(false);
  const justCompleted = useRef(false);

  const triggerHoldComplete = useCallback(() => {
    justCompleted.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLocalValue(target);
    onUpdate(target);
    fillProgress.value = withTiming(0, { duration: 200 });
    cardScale.value = withSpring(1);
  }, [target, onUpdate]);

  const handlePressIn = useCallback(() => {
    if (data.completed) return;
    isHolding.current = true;
    cardScale.value = withTiming(0.97, { duration: 100 });
    fillProgress.value = withTiming(1, { duration: HOLD_DURATION });

    holdTimer.current = setTimeout(() => {
      if (isHolding.current) {
        runOnJS(triggerHoldComplete)();
      }
    }, HOLD_DURATION);
  }, [data.completed, triggerHoldComplete]);

  const handlePressOut = useCallback(() => {
    isHolding.current = false;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (!data.completed) {
      fillProgress.value = withTiming(0, { duration: 150 });
    }
    cardScale.value = withSpring(1);
  }, [data.completed]);

  const handleTap = useCallback(() => {
    if (justCompleted.current) {
      justCompleted.current = false;
      return;
    }
    if (data.completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const undoValue = Math.max(0, target - increment);
      setLocalValue(undoValue);
      onUpdate(undoValue);
    }
  }, [data.completed, target, increment, onUpdate]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
    backgroundColor: `${definition.color}26`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleIncrement = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = localValue + increment;
    setLocalValue(newValue);
    if (!data.completed && newValue >= target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onUpdate(newValue);
  }, [localValue, increment, target, data.completed, onUpdate]);

  const handleDecrement = useCallback(() => {
    if (localValue <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = localValue - increment;
    setLocalValue(newValue);
    onUpdate(newValue);
  }, [localValue, increment, onUpdate]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleTap}
    >
      <Animated.View
        style={[
          styles.card,
          data.completed && styles.cardCompleted,
          cardAnimStyle,
        ]}
      >
        <Animated.View style={[styles.fillOverlay, fillStyle]} />
        <View style={styles.row}>
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

          <View style={styles.textContainer}>
            <Text
              style={[styles.label, data.completed && styles.labelCompleted]}
            >
              {definition.label}
            </Text>
            <Text style={styles.subtitle}>
              {target} {unit} target
            </Text>
          </View>

          {isWater && !data.completed && (
            <View style={styles.cupContainer}>
              <View
                style={[
                  styles.cupFill,
                  {
                    height: `${progress * 100}%`,
                    backgroundColor: `${colors.water}40`,
                  },
                ]}
              />
            </View>
          )}

          {data.completed ? (
            <>
              <Text style={styles.undoLabel}>Undo</Text>
              <View
                style={[styles.checkmark, { backgroundColor: definition.color }]}
              >
                <HabitIcon name="checkmark" size={16} color="#fff" />
              </View>
            </>
          ) : (
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.decrementButton]}
                onPress={handleDecrement}
                disabled={localValue <= 0}
                activeOpacity={0.7}
              >
                <HabitIcon
                  name="remove"
                  size={18}
                  color={localValue <= 0 ? colors.textTertiary : colors.textSecondary}
                />
              </TouchableOpacity>
              <Text style={styles.valueText}>
                {localValue}/{target}
              </Text>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  { backgroundColor: `${definition.color}1A` },
                ]}
                onPress={handleIncrement}
                activeOpacity={0.7}
              >
                <HabitIcon name="add" size={18} color={definition.color} />
              </TouchableOpacity>
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
  fillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: borderRadius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
  subtitle: {
    ...typography.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  cupContainer: {
    width: 24,
    height: 32,
    borderRadius: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1.5,
    borderColor: `${colors.water}60`,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginRight: spacing.sm,
  },
  cupFill: {
    width: '100%',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  decrementButton: {
    backgroundColor: colors.background,
  },
  valueText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'center',
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
});
