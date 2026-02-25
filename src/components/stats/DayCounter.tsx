import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface DayCounterProps {
  dayNumber: number;
  totalDays: number;
}

export function DayCounter({ dayNumber, totalDays }: DayCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.dayNumber}>Day {dayNumber}</Text>
      <Text style={styles.totalDays}>of {totalDays}</Text>
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
    color: colors.textPrimary,
  },
  totalDays: {
    ...typography.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
