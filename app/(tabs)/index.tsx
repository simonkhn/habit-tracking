import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { CelebrationOverlay } from '../../src/components/ui/CelebrationOverlay';
import { HabitCard } from '../../src/components/habits/HabitCard';
import { PartnerSummaryCard } from '../../src/components/partner/PartnerSummaryCard';
import { useHabits } from '../../src/hooks/useHabits';
import { usePartnerHabits } from '../../src/hooks/usePartnerHabits';
import { useAuthStore } from '../../src/stores/authStore';
import { HABIT_ORDER, CHALLENGE_TOTAL_DAYS } from '../../src/config/habits';
import { getDayNumber, formatDateHeader, getTodayDateString } from '../../src/utils/dates';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

export default function TodayScreen() {
  const { profile, partnerProfile } = useAuthStore();
  const {
    habits,
    completedCount,
    isLoading,
    toggleBinaryHabit,
    updateWater,
    updateReading,
    saveJournal,
  } = useHabits();
  const { partnerLog, completedCount: partnerCompletedCount } = usePartnerHabits();

  const [showCelebration, setShowCelebration] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  const dayNumber = profile ? getDayNumber(profile.challengeStartDate) : 1;
  const today = formatDateHeader(getTodayDateString());

  // Trigger celebration when all habits completed
  useEffect(() => {
    if (
      completedCount === HABIT_ORDER.length &&
      prevCompletedCount < HABIT_ORDER.length &&
      prevCompletedCount > 0
    ) {
      setShowCelebration(true);
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount]);

  // Sort habits: incomplete first, completed last
  const sortedHabits = [...HABIT_ORDER].sort((a, b) => {
    const aComplete = habits[a].completed ? 1 : 0;
    const bComplete = habits[b].completed ? 1 : 0;
    return aComplete - bComplete;
  });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Day {dayNumber}</Text>
          </View>
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.displayName?.charAt(0) ?? '?'}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          {completedCount} of {HABIT_ORDER.length}
        </Text>
        <ProgressBar
          progress={completedCount / HABIT_ORDER.length}
          color={colors.success}
          height={6}
        />
      </View>

      {/* Habit cards */}
      <View style={styles.habitList}>
        {sortedHabits.map((habitId) => (
          <View key={habitId} style={styles.habitCardWrapper}>
            <HabitCard
              habitId={habitId}
              habits={habits}
              onToggleBinary={toggleBinaryHabit}
              onUpdateWater={updateWater}
              onUpdateReading={updateReading}
              onSaveJournal={saveJournal}
            />
          </View>
        ))}
      </View>

      {/* Partner summary */}
      {partnerProfile && (
        <PartnerSummaryCard
          partnerName={partnerProfile.displayName}
          habits={partnerLog?.habits ?? null}
          completedCount={partnerCompletedCount}
        />
      )}

      {/* Celebration overlay */}
      <CelebrationOverlay
        visible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  dayBadge: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  dayBadgeText: {
    ...typography.sm,
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
  },
  dateText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.md,
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  habitList: {
    gap: spacing.md,
  },
  habitCardWrapper: {},
});
