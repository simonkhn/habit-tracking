import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { HabitComparison } from '../../types/stats';
import { getHabitDefinition } from '../../config/habits';
import { HabitIcon } from '../habits/HabitIcon';
import { HabitId } from '../../types/habit';

interface HabitComparisonCardProps {
  comparison: HabitComparison;
  myName: string;
  partnerName: string;
}

function getTrendIcon(trend: 'up' | 'down' | 'flat'): {
  name: 'trending-up-outline' | 'trending-down-outline' | 'remove-outline';
  color: string;
} {
  switch (trend) {
    case 'up':
      return { name: 'trending-up-outline', color: colors.success };
    case 'down':
      return { name: 'trending-down-outline', color: colors.error };
    case 'flat':
      return { name: 'remove-outline', color: colors.textTertiary };
  }
}

export function HabitComparisonCard({ comparison, myName, partnerName }: HabitComparisonCardProps) {
  const def = getHabitDefinition(comparison.habitId as HabitId);
  const trend = getTrendIcon(comparison.myTrend);

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${def.color}1A` }]}>
          <HabitIcon name={def.icon} size={18} color={def.color} />
        </View>
        <Text style={[styles.label, { color: def.color }]}>{def.label}</Text>
        <View style={styles.spacer} />
        <Ionicons name={trend.name} size={16} color={trend.color} />
      </View>

      {/* Two-column comparison */}
      <View style={styles.columns}>
        {/* My stats */}
        <View style={styles.column}>
          <Text style={styles.name}>{myName}</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakNumber}>{comparison.myStreak.current}</Text>
            <Text style={styles.streakUnit}> days</Text>
          </View>
          <Text style={styles.best}>best {comparison.myStreak.longest}</Text>
          <View style={styles.dotsRow}>
            {comparison.myLast7Days.map((completed, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: completed ? def.color : colors.border },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Partner stats */}
        <View style={[styles.column, styles.partnerColumn]}>
          <Text style={styles.name}>{partnerName}</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakNumber}>{comparison.partnerStreak.current}</Text>
            <Text style={styles.streakUnit}> days</Text>
          </View>
          <Text style={styles.best}>best {comparison.partnerStreak.longest}</Text>
          <View style={styles.dotsRow}>
            {comparison.partnerLast7Days.map((completed, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: completed ? def.color : colors.border },
                ]}
              />
            ))}
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    marginLeft: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  columns: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  column: {
    flex: 1,
  },
  partnerColumn: {
    paddingLeft: spacing.md,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
  name: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    ...typography.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  streakUnit: {
    ...typography.xs,
    color: colors.textTertiary,
  },
  best: {
    ...typography.xs,
    color: colors.textTertiary,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
