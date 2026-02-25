import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HabitIcon } from '../habits/HabitIcon';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface StreakCounterProps {
  habitLabel: string;
  habitColor: string;
  habitIcon: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export function StreakCounter({
  habitLabel,
  habitColor,
  habitIcon,
  currentStreak,
  longestStreak,
  completionRate,
}: StreakCounterProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${habitColor}1A` }]}>
          <HabitIcon name={habitIcon} size={18} color={habitColor} />
        </View>
        <Text style={[styles.label, { color: habitColor }]}>{habitLabel}</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>current</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>longest</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Math.round(completionRate * 100)}%</Text>
          <Text style={styles.statLabel}>rate</Text>
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
    marginBottom: spacing.md,
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
    ...typography.base,
    fontWeight: fontWeights.semibold,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
