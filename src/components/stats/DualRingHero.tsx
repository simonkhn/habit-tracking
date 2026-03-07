import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface DualRingHeroProps {
  myName: string;
  partnerName: string;
  myCompletedHabits: boolean[];
  partnerCompletedHabits: boolean[];
  totalHabits: number;
  dayNumber: number;
  chunkNumber: number;
}

const HABIT_COLORS = [
  '#E67E22', // wakeUpOnTime
  '#F5A623', // morningSunlight
  '#3498DB', // water
  '#9B59B6', // journal
  '#27AE60', // reading
  '#E74C3C', // workout
  '#00BCD4', // meditate
];

const RING_SIZE = 110;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 3;

function CompletionRing({
  completedHabits,
  total,
}: {
  completedHabits: boolean[];
  total: number;
}) {
  const completedCount = completedHabits.filter(Boolean).length;
  const isComplete = completedCount >= total;
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const segmentLength = (CIRCUMFERENCE - SEGMENT_GAP * total) / total;

  return (
    <View style={ringStyles.container}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Background segments */}
        {completedHabits.map((_, index) => {
          const offset = index * (segmentLength + SEGMENT_GAP);
          const rotation = -90 + (offset / CIRCUMFERENCE) * 360;
          return (
            <Circle
              key={`bg-${index}`}
              cx={cx}
              cy={cy}
              r={RADIUS}
              stroke={colors.border}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          );
        })}
        {/* Colored segments for completed habits */}
        {completedHabits.map((completed, index) => {
          if (!completed) return null;
          const offset = index * (segmentLength + SEGMENT_GAP);
          const rotation = -90 + (offset / CIRCUMFERENCE) * 360;
          return (
            <Circle
              key={`fg-${index}`}
              cx={cx}
              cy={cy}
              r={RADIUS}
              stroke={HABIT_COLORS[index] || colors.textPrimary}
              strokeWidth={isComplete ? STROKE_WIDTH + 2 : STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          );
        })}
      </Svg>
      <View style={ringStyles.labelContainer}>
        <Text style={ringStyles.count}>{completedCount}</Text>
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

function getMotivationalMessage(
  myName: string,
  partnerName: string,
  myCount: number,
  partnerCount: number,
  total: number,
): string {
  const myDone = myCount >= total;
  const partnerDone = partnerCount >= total;

  if (myDone && partnerDone) return 'Both crushed it today!';
  if (myDone) return `${myName} is all done! ${partnerName}, catch up!`;
  if (partnerDone) return `${partnerName} is all done! ${myName}, catch up!`;
  if (myCount === 0 && partnerCount === 0) return 'New day, new chance!';
  return "Keep going, you've got this!";
}

export function DualRingHero({
  myName,
  partnerName,
  myCompletedHabits,
  partnerCompletedHabits,
  totalHabits,
  dayNumber,
  chunkNumber,
}: DualRingHeroProps) {
  const myCount = myCompletedHabits.filter(Boolean).length;
  const partnerCount = partnerCompletedHabits.filter(Boolean).length;
  const message = getMotivationalMessage(
    myName,
    partnerName,
    myCount,
    partnerCount,
    totalHabits,
  );

  return (
    <View style={styles.card}>
      <Text style={styles.dayLabel}>
        Day {dayNumber} · Chunk {chunkNumber}
      </Text>
      <View style={styles.ringsRow}>
        <View style={styles.ringColumn}>
          <CompletionRing completedHabits={myCompletedHabits} total={totalHabits} />
          <Text style={styles.name}>{myName}</Text>
        </View>
        <View style={styles.ringColumn}>
          <CompletionRing completedHabits={partnerCompletedHabits} total={totalHabits} />
          <Text style={styles.name}>{partnerName}</Text>
        </View>
      </View>
      <Text style={styles.motivationalMessage}>{message}</Text>
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
  motivationalMessage: {
    ...typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});
