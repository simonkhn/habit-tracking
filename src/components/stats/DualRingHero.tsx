import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

export interface CompletedHabitInfo {
  habitIndex: number; // index in HABIT_ORDER (for color lookup)
  completedAt: number; // timestamp millis, 0 if not completed
}

interface DualRingHeroProps {
  myName: string;
  partnerName: string;
  myHabitInfos: CompletedHabitInfo[];
  partnerHabitInfos: CompletedHabitInfo[];
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

const HABIT_LABELS = ['Wake Up', 'Sunlight', 'Water', 'Journal', 'Read', 'Workout', 'Meditate'];

const RING_SIZE = 110;
const SVG_SIZE = RING_SIZE + 4; // extra padding to prevent clipping
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 3;

function CompletionRing({
  habitInfos,
  total,
  onSegmentPress,
}: {
  habitInfos: CompletedHabitInfo[];
  total: number;
  onSegmentPress?: (habitIndex: number | null) => void;
}) {
  // Sort completed habits by completedAt timestamp
  const completed = habitInfos
    .filter(h => h.completedAt > 0)
    .sort((a, b) => a.completedAt - b.completedAt);

  const completedCount = completed.length;
  const isComplete = completedCount >= total;
  const cx = SVG_SIZE / 2;
  const cy = SVG_SIZE / 2;
  const segmentLength = (CIRCUMFERENCE - SEGMENT_GAP * total) / total;
  const segmentAngle = 360 / total;

  // Build segment data: first N segments colored (in completion order), rest gray
  const segments = Array.from({ length: total }, (_, i) => {
    if (i < completed.length) {
      return {
        color: HABIT_COLORS[completed[i].habitIndex] || colors.textPrimary,
        habitIndex: completed[i].habitIndex,
        isCompleted: true,
      };
    }
    return {
      color: colors.border,
      habitIndex: -1,
      isCompleted: false,
    };
  });

  return (
    <View style={ringStyles.container}>
      <Svg width={SVG_SIZE} height={SVG_SIZE}>
        {/* Background segments */}
        {segments.map((_, index) => {
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
        {/* Colored segments for completed habits (in completion order) */}
        {segments.map((seg, index) => {
          if (!seg.isCompleted) return null;
          const offset = index * (segmentLength + SEGMENT_GAP);
          const rotation = -90 + (offset / CIRCUMFERENCE) * 360;
          return (
            <Circle
              key={`fg-${index}`}
              cx={cx}
              cy={cy}
              r={RADIUS}
              stroke={seg.color}
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
      {/* Touch targets for each segment */}
      {onSegmentPress &&
        segments.map((seg, i) => {
          if (!seg.isCompleted) return null;
          const angleDeg = -90 + segmentAngle * i + segmentAngle / 2;
          const angleRad = (angleDeg * Math.PI) / 180;
          const touchX = cx + RADIUS * Math.cos(angleRad) - 10;
          const touchY = cy + RADIUS * Math.sin(angleRad) - 10;
          return (
            <Pressable
              key={`touch-${i}`}
              onPress={() => onSegmentPress(seg.habitIndex)}
              style={[
                ringStyles.touchTarget,
                { left: touchX, top: touchY },
              ]}
            />
          );
        })}
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
    width: SVG_SIZE,
    height: SVG_SIZE,
  },
  touchTarget: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  labelContainer: {
    position: 'absolute',
    width: SVG_SIZE,
    height: SVG_SIZE,
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
  myHabitInfos,
  partnerHabitInfos,
  totalHabits,
  dayNumber,
  chunkNumber,
}: DualRingHeroProps) {
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);

  const myCount = myHabitInfos.filter(h => h.completedAt > 0).length;
  const partnerCount = partnerHabitInfos.filter(h => h.completedAt > 0).length;
  const message = getMotivationalMessage(
    myName,
    partnerName,
    myCount,
    partnerCount,
    totalHabits,
  );

  // Auto-dismiss tooltip after 2 seconds
  useEffect(() => {
    if (selectedHabit === null) return;
    const timer = setTimeout(() => {
      setSelectedHabit(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [selectedHabit]);

  const handleSegmentPress = (habitIndex: number | null) => {
    setSelectedHabit(prev => (prev === habitIndex ? null : habitIndex));
  };

  return (
    <View style={styles.card}>
      <Text style={styles.dayLabel}>
        Day {dayNumber} · Chunk {chunkNumber}
      </Text>
      {selectedHabit !== null && (
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>
              {HABIT_LABELS[selectedHabit] ?? 'Habit'}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.ringsRow}>
        <View style={styles.ringColumn}>
          <CompletionRing
            habitInfos={myHabitInfos}
            total={totalHabits}
            onSegmentPress={handleSegmentPress}
          />
          <Text style={styles.name}>{myName}</Text>
        </View>
        <View style={styles.ringColumn}>
          <CompletionRing
            habitInfos={partnerHabitInfos}
            total={totalHabits}
            onSegmentPress={handleSegmentPress}
          />
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
  tooltipContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tooltip: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tooltipText: {
    ...typography.xs,
    color: colors.background,
    fontWeight: fontWeights.semibold,
  },
});
