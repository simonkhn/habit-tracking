import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useHoldToComplete } from '../../hooks/useHoldToComplete';
import { HabitDefinition, WaterHabitData, ReadingHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { WATER_INCREMENT_OZ, READING_TARGET_PAGES } from '../../config/habits';
import { useAuthStore } from '../../stores/authStore';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';

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
  const { colors } = useTheme();
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

  const handleHoldComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLocalValue(target);
    onUpdate(target);
  }, [target, onUpdate]);

  const handleUndo = useCallback(() => {
    const undoValue = Math.max(0, localValue - increment);
    setLocalValue(undoValue);
    onUpdate(undoValue);
  }, [localValue, increment, onUpdate]);

  const { fillStyle, cardAnimStyle, pressHandlers } = useHoldToComplete({
    completed: data.completed,
    onComplete: handleHoldComplete,
    onUndo: handleUndo,
    color: definition.color,
  });

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
    <Pressable {...pressHandlers}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
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
              style={[styles.label, { color: colors.textPrimary }, data.completed && [styles.labelCompleted, { color: colors.textTertiary }]]}
            >
              {definition.label}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
              {target} {unit} target
            </Text>
          </View>

          {isWater && !data.completed && (
            <View style={[styles.cupContainer, { borderColor: `${colors.water}60` }]}>
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
              <Text style={[styles.undoLabel, { color: colors.textTertiary }]}>Undo</Text>
              <View
                style={[styles.checkmark, { backgroundColor: definition.color }]}
              >
                <HabitIcon name="checkmark" size={16} color={colors.textOnPrimary} />
              </View>
            </>
          ) : (
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.background }]}
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
              <Text style={[styles.valueText, { color: colors.textSecondary }]}>
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
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
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
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
  },
  subtitle: {
    ...typography.sm,
    marginTop: 2,
  },
  cupContainer: {
    width: 24,
    height: 32,
    borderRadius: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1.5,
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
  },
  valueText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    minWidth: 40,
    textAlign: 'center',
  },
  undoLabel: {
    ...typography.xs,
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
