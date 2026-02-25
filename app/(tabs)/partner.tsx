import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { PartnerHabitRow } from '../../src/components/partner/PartnerHabitRow';
import { usePartnerHabits } from '../../src/hooks/usePartnerHabits';
import { useAuthStore } from '../../src/stores/authStore';
import { HABIT_ORDER } from '../../src/config/habits';
import { getDayNumber, formatDateHeader, getTodayDateString } from '../../src/utils/dates';
import { createEmptyDayHabits } from '../../src/config/habits';
import { colors, typography, fontWeights, spacing } from '../../src/theme';

export default function PartnerScreen() {
  const { partnerProfile, profile } = useAuthStore();
  const { partnerLog, isLoading, completedCount } = usePartnerHabits();

  if (!partnerProfile) {
    return (
      <ScreenContainer>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No partner linked yet</Text>
          <Text style={styles.emptySubtext}>
            Link your partner in the Firebase console
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      </ScreenContainer>
    );
  }

  const dayNumber = profile ? getDayNumber(profile.challengeStartDate) : 1;
  const habits = partnerLog?.habits ?? createEmptyDayHabits();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>{partnerProfile.displayName}'s Day</Text>
        <Text style={styles.date}>{formatDateHeader(getTodayDateString())}</Text>
      </View>

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

      <Card>
        {HABIT_ORDER.map((habitId, index) => (
          <View key={habitId}>
            {index > 0 && <View style={styles.divider} />}
            <PartnerHabitRow
              habitId={habitId}
              habits={habits}
              partnerWaterTarget={partnerProfile.waterTargetOz}
            />
          </View>
        ))}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  date: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.md,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  emptySubtext: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
