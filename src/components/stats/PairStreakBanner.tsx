import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface PairStreakBannerProps {
  currentStreak: number;
  longestStreak: number;
}

function getFlameConfig(streak: number): { size: number; color: string } {
  if (streak <= 0) return { size: 28, color: colors.textTertiary };
  if (streak <= 6) return { size: 32, color: '#E67E22' };
  if (streak <= 13) return { size: 36, color: '#E67E22' };
  return { size: 40, color: '#E74C3C' };
}

export function PairStreakBanner({ currentStreak, longestStreak }: PairStreakBannerProps) {
  const flame = getFlameConfig(currentStreak);
  const isActive = currentStreak > 0;

  return (
    <View
      style={[
        styles.card,
        isActive && styles.cardActive,
      ]}
    >
      <Text style={styles.label}>PAIR STREAK</Text>

      <View style={styles.mainRow}>
        <Ionicons name="flame-outline" size={flame.size} color={flame.color} />

        <View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day pair streak</Text>
        </View>
      </View>

      <Text style={styles.best}>Best: {longestStreak} days</Text>
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
  cardActive: {
    borderColor: '#E67E22',
    backgroundColor: '#FFF8F0',
  },
  label: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakNumber: {
    ...typography.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  streakLabel: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  best: {
    ...typography.xs,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
});
