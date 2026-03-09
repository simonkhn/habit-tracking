import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HabitIcon } from '../habits/HabitIcon';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${habitColor}1A` }]}>
          <HabitIcon name={habitIcon} size={18} color={habitColor} />
        </View>
        <Text style={[styles.label, { color: habitColor }]}>{habitLabel}</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>current</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{longestStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>longest</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{Math.round(completionRate * 100)}%</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>rate</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
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
  },
  statLabel: {
    ...typography.xs,
    marginTop: 2,
  },
});
