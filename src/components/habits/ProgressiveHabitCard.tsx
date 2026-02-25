import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HabitDefinition, WaterHabitData, ReadingHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
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

  const [localValue, setLocalValue] = useState(currentValue);

  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  const target = isWater ? (profile?.waterTargetOz ?? 80) : READING_TARGET_PAGES;
  const increment = isWater ? WATER_INCREMENT_OZ : 1;
  const unit = isWater ? 'oz' : 'pages';
  const progress = target > 0 ? Math.min(localValue / target, 1) : 0;

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
    <View style={[styles.card, data.completed && styles.cardCompleted]}>
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

        {isWater && (
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
          <View
            style={[styles.checkmark, { backgroundColor: definition.color }]}
          >
            <HabitIcon name="checkmark" size={16} color="#fff" />
          </View>
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
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
