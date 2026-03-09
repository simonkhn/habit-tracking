import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { CelebrationOverlay } from '../../src/components/ui/CelebrationOverlay';
import { HabitCard } from '../../src/components/habits/HabitCard';
import { PersonalHabitCard } from '../../src/components/habits/PersonalHabitCard';
import { TimedHabitCard } from '../../src/components/habits/TimedHabitCard';
import { PartnerSummaryCard } from '../../src/components/partner/PartnerSummaryCard';
import { useHabits } from '../../src/hooks/useHabits';
import { usePersonalHabits } from '../../src/hooks/usePersonalHabits';
import { usePartnerHabits } from '../../src/hooks/usePartnerHabits';
import { useAuthStore } from '../../src/stores/authStore';
import { HABIT_ORDER, CHALLENGE_TOTAL_DAYS } from '../../src/config/habits';
import { getDayNumber, formatDateHeader, getHabitDateString } from '../../src/utils/dates';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

export default function TodayScreen() {
  const { colors } = useTheme();
  const { profile, partnerProfile } = useAuthStore();
  const {
    habits,
    completedCount,
    isLoading,
    toggleBinaryHabit,
    updateWater,
    updateReading,
    saveWorkoutNote,
  } = useHabits();
  const { partnerLog, completedCount: partnerCompletedCount } = usePartnerHabits();
  const {
    personalHabits,
    habits: personalHabitData,
    togglePersonalHabit,
  } = usePersonalHabits();

  const [showCelebration, setShowCelebration] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  const dayNumber = profile ? getDayNumber(profile.challengeStartDate, profile.wakeUpTime) : 1;
  const today = formatDateHeader(getHabitDateString(profile?.wakeUpTime ?? '06:00'));

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
    const aComplete = habits[a]?.completed ? 1 : 0;
    const bComplete = habits[b]?.completed ? 1 : 0;
    return aComplete - bComplete;
  });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.dayBadge, { backgroundColor: colors.textPrimary }]}>
            <Text style={[styles.dayBadgeText, { color: colors.textOnPrimary }]}>Day {dayNumber}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{today}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.textPrimary }]}>
          <Text style={[styles.avatarText, { color: colors.textOnPrimary }]}>
            {profile?.displayName?.charAt(0) ?? '?'}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
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
              onSaveWorkoutNote={saveWorkoutNote}
            />
          </View>
        ))}
      </View>

      {/* Personal habits */}
      {personalHabits.length > 0 && (
        <View style={styles.personalSection}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>Personal</Text>
          <View style={styles.habitList}>
            {personalHabits.map((habit) => (
              <View key={habit.id} style={styles.habitCardWrapper}>
                {habit.type === 'timed' ? (
                  <TimedHabitCard
                    definition={habit}
                    data={personalHabitData[habit.id]}
                    onToggle={() => togglePersonalHabit(habit.id)}
                  />
                ) : (
                  <PersonalHabitCard
                    definition={habit}
                    data={personalHabitData[habit.id]}
                    onToggle={() => togglePersonalHabit(habit.id)}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      )}

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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  dayBadgeText: {
    ...typography.sm,
    fontWeight: fontWeights.bold,
  },
  dateText: {
    ...typography.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.md,
    fontWeight: fontWeights.bold,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.sm,
  },
  habitList: {
    gap: spacing.md,
  },
  habitCardWrapper: {},
  personalSection: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
});
