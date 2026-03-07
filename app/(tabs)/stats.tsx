import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { DualRingHero } from '../../src/components/stats/DualRingHero';
import { PairStreakBanner } from '../../src/components/stats/PairStreakBanner';
import { ChunkGrid } from '../../src/components/stats/ChunkGrid';
import { HabitBreakdownTable } from '../../src/components/stats/HabitComparisonCard';
import { BadgeShelf } from '../../src/components/stats/BadgeShelf';
import { DayDetailSheet } from '../../src/components/stats/DayDetailSheet';
import { useSharedStats } from '../../src/hooks/useSharedStats';
import { useAuthStore } from '../../src/stores/authStore';
import { getDayNumber, getHabitDate, getHabitDateString } from '../../src/utils/dates';
import { HABIT_ORDER, CHUNK_SIZE_DAYS } from '../../src/config/habits';
import { colors, typography, fontWeights, spacing } from '../../src/theme';

export default function StatsScreen() {
  const { stats, isLoading, myLogs, partnerLogs } = useSharedStats();
  const { profile, partnerProfile } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const myName = profile?.displayName ?? 'Me';
  const partnerName = partnerProfile?.displayName ?? 'Partner';
  const wakeUpTime = profile?.wakeUpTime ?? '06:00';
  const todayString = getHabitDateString(wakeUpTime);

  const handleDayPress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const selectedDayData = useMemo(() => {
    if (!selectedDate || !profile) return null;
    const myLog = myLogs.find((l) => l.date === selectedDate);
    const partnerLog = partnerLogs.find((l) => l.date === selectedDate);
    const dayNum = getDayNumber(profile.challengeStartDate, wakeUpTime);
    const selectedDayNum = dayNum - Math.round(
      (getHabitDate(wakeUpTime).getTime() - new Date(selectedDate + 'T00:00:00').getTime()) / 86400000
    );
    const chunkDayNum = ((selectedDayNum - 1) % CHUNK_SIZE_DAYS) + 1;
    return {
      myLog,
      partnerLog,
      dayLabel: `Day ${selectedDayNum} (Day ${chunkDayNum} of chunk)`,
    };
  }, [selectedDate, myLogs, partnerLogs, profile, wakeUpTime]);

  // Derived badge props
  const bestHabitStreak = useMemo(() => {
    if (!stats) return 0;
    return Math.max(
      ...stats.myHabitStreaks.map((s) => s.currentStreak),
      ...stats.partnerHabitStreaks.map((s) => s.currentStreak),
      0
    );
  }, [stats]);

  const hasPerfectPairDay = useMemo(() => {
    if (!stats) return false;
    return stats.pairDayResults.some((d) => d.bothComplete);
  }, [stats]);

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
        <Text style={styles.title}>Stats</Text>
      </View>

      <DualRingHero
        myName={myName}
        partnerName={partnerName}
        myHabitInfos={stats.myTodayHabitInfos}
        partnerHabitInfos={stats.partnerTodayHabitInfos}
        totalHabits={HABIT_ORDER.length}
        dayNumber={stats.dayNumber}
        chunkNumber={stats.chunkNumber}
      />

      <View style={styles.section}>
        <PairStreakBanner
          currentStreak={stats.pairStreak}
          longestStreak={stats.longestPairStreak}
        />
      </View>

      <View style={styles.section}>
        <BadgeShelf
          earnedBadges={stats.earnedBadges}
          dayNumber={stats.dayNumber}
          bestHabitStreak={bestHabitStreak}
          pairStreak={stats.pairStreak}
          longestPairStreak={stats.longestPairStreak}
          hasPerfectPairDay={hasPerfectPairDay}
        />
      </View>

      <View style={styles.section}>
        <ChunkGrid
          pairDayResults={stats.pairDayResults}
          myName={myName}
          partnerName={partnerName}
          dayNumber={stats.dayNumber}
          chunkNumber={stats.chunkNumber}
          onDayPress={handleDayPress}
          today={todayString}
        />
      </View>

      <Text style={styles.sectionTitle}>Habit Breakdown</Text>
      <HabitBreakdownTable
        comparisons={stats.habitComparisons}
        myName={myName}
        partnerName={partnerName}
      />

      {selectedDate && selectedDayData && (
        <DayDetailSheet
          visible={!!selectedDate}
          date={selectedDate}
          myName={myName}
          partnerName={partnerName}
          myLog={selectedDayData.myLog}
          partnerLog={selectedDayData.partnerLog}
          myWaterTarget={profile?.waterTargetOz ?? 80}
          partnerWaterTarget={partnerProfile?.waterTargetOz ?? 65}
          dayLabel={selectedDayData.dayLabel}
          onClose={handleCloseSheet}
        />
      )}
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
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
