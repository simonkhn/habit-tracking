import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface PairStreakBannerProps {
  currentStreak: number;
  longestStreak: number;
}

export function PairStreakBanner({ currentStreak, longestStreak }: PairStreakBannerProps) {
  const { colors } = useTheme();
  const isActive = currentStreak > 0;
  const flameColor = currentStreak <= 0 ? colors.textTertiary : currentStreak <= 13 ? colors.pairStreakActiveBorder : colors.error;

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isActive && { borderColor: colors.pairStreakActiveBorder, backgroundColor: colors.pairStreakActiveBg },
      ]}
    >
      <Ionicons name="flame" size={22} color={flameColor} />
      <Text style={[styles.streakText, { color: colors.textPrimary }]}>
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        {'-day pair streak'}
      </Text>
      <View style={styles.spacer} />
      <Text style={[styles.best, { color: colors.textTertiary }]}>best: {longestStreak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  streakText: {
    ...typography.sm,
  },
  streakNumber: {
    fontWeight: fontWeights.bold,
  },
  spacer: {
    flex: 1,
  },
  best: {
    ...typography.xs,
  },
});
