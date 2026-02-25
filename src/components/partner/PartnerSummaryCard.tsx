import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayHabits } from '../../types/habit';
import { HABIT_ORDER, getHabitDefinition } from '../../config/habits';
import { Card } from '../ui/Card';
import { colors, typography, fontWeights, spacing } from '../../theme';

interface PartnerSummaryCardProps {
  partnerName: string;
  habits: DayHabits | null;
  completedCount: number;
}

export function PartnerSummaryCard({
  partnerName,
  habits,
  completedCount,
}: PartnerSummaryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{partnerName}</Text>
        <Text style={styles.count}>
          {completedCount} / {HABIT_ORDER.length}
        </Text>
      </View>
      {habits && (
        <View style={styles.dots}>
          {HABIT_ORDER.map((id) => {
            const def = getHabitDefinition(id);
            const completed = habits[id].completed;
            return (
              <View
                key={id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: completed
                      ? def.color
                      : `${def.color}30`,
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  count: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
