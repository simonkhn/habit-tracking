import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';
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

export function HabitComparisonRow({ comparison, isLast }: HabitComparisonRowProps) {
  const def = getHabitDefinition(comparison.habitId as HabitId);
  const trend = getTrendIcon(comparison.myTrend);

  return (
    <View
      style={[
        styles.row,
        { borderLeftColor: def.color },
        !isLast && styles.rowBorder,
      ]}
    >
      {/* Left: Icon + Name */}
      <View style={styles.habitInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${def.color}1A` }]}>
          <HabitIcon name={def.icon} size={14} color={def.color} />
        </View>
        <Text style={[styles.habitName, { color: def.color }]} numberOfLines={1}>
          {def.label}
        </Text>
      </View>

      {/* Center-left: My streak */}
      <View style={styles.streakCell}>
        <Text style={styles.streakNumber}>{comparison.myStreak.current}</Text>
        <Text style={styles.bestLabel}>best {comparison.myStreak.longest}</Text>
      </View>

      {/* Center-right: Partner streak */}
      <View style={styles.streakCell}>
        <Text style={styles.streakNumber}>{comparison.partnerStreak.current}</Text>
        <Text style={styles.bestLabel}>best {comparison.partnerStreak.longest}</Text>
      </View>

      {/* Right: 7-day dot grid (2 rows) */}
      <View style={styles.dotsGrid}>
        <View style={styles.dotsRow}>
          {comparison.myLast7Days.map((completed, i) => (
            <View
              key={`my-${i}`}
              style={[
                styles.dot,
                { backgroundColor: completed ? def.color : colors.border },
              ]}
            />
          ))}
        </View>
        <View style={styles.dotsRow}>
          {comparison.partnerLast7Days.map((completed, i) => (
            <View
              key={`p-${i}`}
              style={[
                styles.dot,
                { backgroundColor: completed ? def.color : colors.border },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Far right: Trend */}
      <View style={styles.trendCell}>
        <Ionicons name={trend.name} size={14} color={trend.color} />
      </View>
    </View>
  );
}

export function HabitBreakdownTable({ comparisons, myName, partnerName }: HabitBreakdownTableProps) {
  return (
    <View style={styles.tableCard}>
      {/* Column headers */}
      <View style={styles.headerRow}>
        <View style={styles.habitInfo}>
          <Text style={styles.headerText}>{' '}</Text>
        </View>
        <View style={styles.streakCell}>
          <Text style={styles.headerText} numberOfLines={1}>{myName}</Text>
        </View>
        <View style={styles.streakCell}>
          <Text style={styles.headerText} numberOfLines={1}>{partnerName}</Text>
        </View>
        <View style={styles.dotsGrid}>
          <Text style={styles.headerText}>7 days</Text>
        </View>
        <View style={styles.trendCell}>
          <Text style={styles.headerText}>{' '}</Text>
        </View>
      </View>

      {/* Rows */}
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
  // --- Table card ---
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    paddingLeft: spacing.md + 3, // account for left accent bar in rows
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.textTertiary,
  },

  // --- Row ---
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingRight: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // --- Habit info (left) ---
  habitInfo: {
    flex: 2.5,
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

  // --- Streak cells ---
  streakCell: {
    flex: 1.2,
    alignItems: 'center',
  },
  streakNumber: {
    ...typography.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  bestLabel: {
    ...typography.xs,
    color: colors.textTertiary,
    lineHeight: 14,
  },

  // --- Dots grid ---
  dotsGrid: {
    flex: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // --- Trend ---
  trendCell: {
    width: 20,
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
});
