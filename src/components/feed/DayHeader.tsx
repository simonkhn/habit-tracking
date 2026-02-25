import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontWeights, spacing } from '../../theme';

interface DayHeaderProps {
  label: string;
}

export function DayHeader({ label }: DayHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
  },
});
