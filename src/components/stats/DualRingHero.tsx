import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface DualRingHeroProps {
  myName: string;
  partnerName: string;
  myCompletedCount: number;
  partnerCompletedCount: number;
  totalHabits: number;
  dayNumber: number;
  chunkNumber: number;
}

const RING_SIZE = 100;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const rate = total > 0 ? completed / total : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - rate);
  const isComplete = completed >= total;
  const strokeColor = isComplete ? colors.success : colors.textPrimary;
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  return (
    <View style={ringStyles.container}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          stroke={colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={ringStyles.labelContainer}>
        <Text style={ringStyles.count}>{completed}</Text>
        <Text style={ringStyles.total}>/{total}</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  count: {
    ...typography.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  total: {
    ...typography.xs,
    color: colors.textTertiary,
  },
});

export function DualRingHero({
  myName,
  partnerName,
  myCompletedCount,
  partnerCompletedCount,
  totalHabits,
  dayNumber,
  chunkNumber,
}: DualRingHeroProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.dayLabel}>
        Day {dayNumber} · Chunk {chunkNumber}
      </Text>
      <View style={styles.ringsRow}>
        <View style={styles.ringColumn}>
          <CompletionRing completed={myCompletedCount} total={totalHabits} />
          <Text style={styles.name}>{myName}</Text>
        </View>
        <View style={styles.ringColumn}>
          <CompletionRing completed={partnerCompletedCount} total={totalHabits} />
          <Text style={styles.name}>{partnerName}</Text>
        </View>
      </View>
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
  dayLabel: {
    ...typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  ringColumn: {
    alignItems: 'center',
  },
  name: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
