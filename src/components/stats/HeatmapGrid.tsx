import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { DayStats } from '../../types/stats';
import { HABIT_ORDER } from '../../config/habits';
import { colors, typography, fontWeights, spacing } from '../../theme';
import { format, subDays, parseISO, getDay } from 'date-fns';

interface HeatmapGridProps {
  dailyStats: DayStats[];
  days?: number;
}

const CELL_SIZE = 14;
const CELL_GAP = 3;
const ROWS = 7; // days of week

function getIntensity(completedCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  const ratio = completedCount / totalCount;
  if (ratio === 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function HeatmapGrid({ dailyStats, days = 90 }: HeatmapGridProps) {
  const statsMap = new Map(dailyStats.map((s) => [s.date, s]));
  const today = new Date();
  const cells: { date: string; intensity: number; col: number; row: number }[] = [];

  // Build grid from right (today) to left
  const totalCols = Math.ceil(days / 7);

  for (let i = 0; i < days; i++) {
    const date = subDays(today, days - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date); // 0=Sun, 6=Sat
    const col = Math.floor(i / 7);
    const row = dayOfWeek;

    const stat = statsMap.get(dateStr);
    const intensity = stat
      ? getIntensity(stat.completedCount, stat.totalCount)
      : 0;

    cells.push({ date: dateStr, intensity, col, row });
  }

  const svgWidth = totalCols * (CELL_SIZE + CELL_GAP);
  const svgHeight = ROWS * (CELL_SIZE + CELL_GAP);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={svgWidth} height={svgHeight}>
          {cells.map(({ date, intensity, col, row }) => (
            <Rect
              key={date}
              x={col * (CELL_SIZE + CELL_GAP)}
              y={row * (CELL_SIZE + CELL_GAP)}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              fill={colors.heatmap[intensity]}
            />
          ))}
        </Svg>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
