import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { DayCounter } from '../../src/components/stats/DayCounter';
import { CompletionRateChart } from '../../src/components/stats/CompletionRateChart';
import { HeatmapGrid } from '../../src/components/stats/HeatmapGrid';
import { StreakCounter } from '../../src/components/stats/StreakCounter';
import { useStats } from '../../src/hooks/useStats';
import { getHabitDefinition, HABIT_ORDER, CHALLENGE_TOTAL_DAYS } from '../../src/config/habits';
import { colors, typography, fontWeights, spacing } from '../../src/theme';

export default function StatsScreen() {
  const { stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!stats) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Text style={styles.emptyText}>No data yet</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
      </View>

      <DayCounter dayNumber={stats.dayNumber} totalDays={CHALLENGE_TOTAL_DAYS} />

      <View style={styles.completionRow}>
        <CompletionRateChart rate={stats.overallCompletionRate} />
      </View>

      <View style={styles.section}>
        <HeatmapGrid dailyStats={stats.dailyStats} />
      </View>

      <Text style={styles.sectionTitle}>Per Habit</Text>
      <View style={styles.habitStats}>
        {stats.habitStreaks.map((streak) => {
          const def = getHabitDefinition(streak.habitId as any);
          return (
            <View key={streak.habitId} style={styles.streakCard}>
              <StreakCounter
                habitLabel={def.label}
                habitColor={def.color}
                habitIcon={def.icon}
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
                completionRate={streak.completionRate}
              />
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
  },
  completionRow: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  habitStats: {
    gap: spacing.md,
  },
  streakCard: {},
});
