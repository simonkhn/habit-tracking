import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { HabitComparison } from '../../types/stats';
import { getHabitDefinition } from '../../config/habits';
import { HabitIcon } from '../habits/HabitIcon';
import { HabitId } from '../../types/habit';

interface HabitComparisonRowProps {
  comparison: HabitComparison;
  isLast: boolean;
}

interface HabitBreakdownTableProps {
  comparisons: HabitComparison[];
  myName: string;
  partnerName: string;
}

export function HabitComparisonRow({ comparison, isLast }: HabitComparisonRowProps) {
  const { colors } = useTheme();
  const def = getHabitDefinition(comparison.habitId as HabitId);

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

  const trend = getTrendIcon(comparison.myTrend);

  return (
    <View
      style={[
        styles.row,
        { borderLeftColor: def.color },
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.habitInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${def.color}1A` }]}>
          <HabitIcon name={def.icon} size={14} color={def.color} />
        </View>
        <Text style={[styles.habitName, { color: def.color }]} numberOfLines={1}>
          {def.shortLabel || def.label}
        </Text>
      </View>

      <View style={styles.streakCell}>
        <Text style={[styles.streakNumber, { color: colors.textPrimary }]}>{comparison.myStreak.current}</Text>
        <Text style={[styles.bestLabel, { color: colors.textTertiary }]}>best {comparison.myStreak.longest}</Text>
      </View>

      <View style={styles.streakCell}>
        <Text style={[styles.streakNumber, { color: colors.textPrimary }]}>{comparison.partnerStreak.current}</Text>
        <Text style={[styles.bestLabel, { color: colors.textTertiary }]}>best {comparison.partnerStreak.longest}</Text>
      </View>

      <View style={styles.trendCell}>
        <Ionicons name={trend.name} size={14} color={trend.color} />
      </View>
    </View>
  );
}

export function HabitBreakdownTable({ comparisons, myName, partnerName }: HabitBreakdownTableProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <View style={styles.habitInfo}>
          <Text style={[styles.headerText, { color: colors.textTertiary }]}>{' '}</Text>
        </View>
        <View style={styles.streakCell}>
          <Text style={[styles.headerText, { color: colors.textTertiary }]} numberOfLines={1}>{myName}</Text>
        </View>
        <View style={styles.streakCell}>
          <Text style={[styles.headerText, { color: colors.textTertiary }]} numberOfLines={1}>{partnerName}</Text>
        </View>
        <View style={styles.trendCell}>
          <Text style={[styles.headerText, { color: colors.textTertiary }]}>{' '}</Text>
        </View>
      </View>

      {comparisons.map((comparison, index) => (
        <HabitComparisonRow
          key={comparison.habitId}
          comparison={comparison}
          isLast={index === comparisons.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    paddingLeft: spacing.md + 3,
    borderBottomWidth: 1,
  },
  headerText: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingRight: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
  },

  habitInfo: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    marginLeft: spacing.sm,
    flexShrink: 1,
  },

  streakCell: {
    flex: 1.2,
    alignItems: 'center',
  },
  streakNumber: {
    ...typography.base,
    fontWeight: fontWeights.bold,
    lineHeight: 18,
  },
  bestLabel: {
    ...typography.xs,
    lineHeight: 14,
  },

  trendCell: {
    width: 20,
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
});
