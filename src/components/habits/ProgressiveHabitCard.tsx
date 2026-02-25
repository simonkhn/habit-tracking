import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HabitDefinition, WaterHabitData, ReadingHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { ProgressBar } from '../ui/ProgressBar';
import { WaterFillVisual } from './WaterFillVisual';
import { WATER_INCREMENT_OZ, READING_TARGET_PAGES } from '../../config/habits';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

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

  // Optimistic local state for instant tap feedback
  const [localValue, setLocalValue] = useState(currentValue);

  // Sync local state when external data arrives (e.g. Firestore snapshot)
  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  const target = isWater ? (profile?.waterTargetOz ?? 80) : READING_TARGET_PAGES;
  const increment = isWater ? WATER_INCREMENT_OZ : 1;
  const unit = isWater ? 'oz' : 'pages';
  const progress = target > 0 ? localValue / target : 0;

  const handleIncrement = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = localValue + increment;
    setLocalValue(newValue); // Instant visual update
    if (!data.completed && newValue >= target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onUpdate(newValue);
  }, [localValue, increment, target, data.completed, onUpdate]);

  const handleDecrement = useCallback(() => {
    if (localValue <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = localValue - increment;
    setLocalValue(newValue); // Instant visual update
    onUpdate(newValue);
  }, [localValue, increment, onUpdate]);

  return (
    <View style={[styles.card, data.completed && styles.cardCompleted]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
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
          <View>
            <Text
              style={[styles.label, data.completed && styles.labelCompleted]}
            >
              {definition.label}
            </Text>
            <Text style={styles.valueText}>
              {localValue} / {target} {unit}
            </Text>
          </View>
        </View>
        {data.completed && (
          <View
            style={[styles.checkmark, { backgroundColor: definition.color }]}
          >
            <HabitIcon name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </View>

      {isWater && (
        <View style={styles.waterVisual}>
          <WaterFillVisual progress={progress} height={60} />
        </View>
      )}

      <ProgressBar
        progress={progress}
        color={definition.color}
        style={styles.progressBar}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.decrementButton]}
          onPress={handleDecrement}
          disabled={localValue <= 0}
          activeOpacity={0.7}
        >
          <HabitIcon
            name="remove"
            size={20}
            color={localValue <= 0 ? colors.textTertiary : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: `${definition.color}1A` },
          ]}
          onPress={handleIncrement}
          activeOpacity={0.7}
        >
          <HabitIcon name="add" size={20} color={definition.color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
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
  label: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  valueText: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterVisual: {
    marginTop: spacing.md,
  },
  progressBar: {
    marginTop: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  decrementButton: {
    backgroundColor: colors.background,
  },
});
