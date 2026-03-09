import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, typography, fontWeights, spacing } from '../../theme';

interface DayHeaderProps {
  label: string;
}

export function DayHeader({ label }: DayHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
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
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    paddingHorizontal: spacing.md,
  },
});
