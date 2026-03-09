import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface DayCounterProps {
  dayNumber: number;
  totalDays: number;
}

export function DayCounter({ dayNumber, totalDays }: DayCounterProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.dayNumber, { color: colors.textPrimary }]}>Day {dayNumber}</Text>
      <Text style={[styles.totalDays, { color: colors.textSecondary }]}>of {totalDays}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  dayNumber: {
    ...typography.xxl,
    fontWeight: fontWeights.bold,
  },
  totalDays: {
    ...typography.md,
    marginTop: spacing.xs,
  },
});
