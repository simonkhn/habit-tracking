import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HabitId, DayHabits, WaterHabitData, ReadingHabitData, WorkoutHabitData } from '../../types/habit';
import { getHabitDefinition } from '../../config/habits';
import { HabitIcon } from '../habits/HabitIcon';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface PartnerHabitRowProps {
  habitId: HabitId;
  habits: DayHabits;
  partnerWaterTarget: number;
}

export function PartnerHabitRow({ habitId, habits, partnerWaterTarget }: PartnerHabitRowProps) {
  const definition = getHabitDefinition(habitId);
  const data = habits[habitId];

  let detail = '';
  if (habitId === 'water') {
    const waterData = data as WaterHabitData;
    detail = `${waterData.currentOz}/${partnerWaterTarget} oz`;
  } else if (habitId === 'reading') {
    const readingData = data as ReadingHabitData;
    detail = `${readingData.pagesRead}/10 pages`;
  } else if (habitId === 'workout' && data.completed) {
    const workoutData = data as WorkoutHabitData;
    if (workoutData.note) {
      detail = workoutData.note;
    }
  }

  return (
    <View style={[styles.row, data.completed && styles.rowCompleted]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${definition.color}1A` },
        ]}
      >
        <HabitIcon name={definition.icon} size={18} color={definition.color} />
      </View>
      <Text style={[styles.label, data.completed && styles.labelCompleted]}>
        {definition.label}
      </Text>
      {detail ? (
        <Text style={styles.detail} numberOfLines={1}>
          {detail}
        </Text>
      ) : null}
      {data.completed && (
        <View
          style={[styles.checkmark, { backgroundColor: definition.color }]}
        >
          <HabitIcon name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rowCompleted: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  detail: {
    ...typography.xs,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    maxWidth: 120,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
