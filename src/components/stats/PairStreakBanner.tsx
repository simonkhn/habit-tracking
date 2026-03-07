import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface PairStreakBannerProps {
  currentStreak: number;
  longestStreak: number;
}

export function PairStreakBanner({ currentStreak, longestStreak }: PairStreakBannerProps) {
  const isActive = currentStreak > 0;
  const flameColor = currentStreak <= 0 ? colors.textTertiary : currentStreak <= 13 ? '#E67E22' : '#E74C3C';

  return (
    <View style={[styles.row, isActive && styles.rowActive]}>
      <Ionicons name="flame" size={22} color={flameColor} />
      <Text style={styles.streakText}>
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        {'-day pair streak'}
      </Text>
      <View style={styles.spacer} />
      <Text style={styles.best}>best: {longestStreak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowActive: {
    borderColor: '#E67E22',
    backgroundColor: '#FFF8F0',
  },
  streakText: {
    ...typography.sm,
    color: colors.textPrimary,
  },
  streakNumber: {
    fontWeight: fontWeights.bold,
  },
  spacer: {
    flex: 1,
  },
  best: {
    ...typography.xs,
    color: colors.textTertiary,
  },
});
