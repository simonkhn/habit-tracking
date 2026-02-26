import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { PairDayResult } from '../../types/stats';
import { getTodayDateString } from '../../utils/dates';

interface ChunkGridProps {
  pairDayResults: PairDayResult[];
  myName: string;
  partnerName: string;
  dayNumber: number;
  chunkNumber: number;
  onDayPress?: (date: string) => void;
}

const CELL_SIZE = 48;
const GAP = spacing.sm;

function getCellStyle(day: PairDayResult, isToday: boolean, isFuture: boolean) {
  let backgroundColor: string;
  let textColor: string;

  if (isFuture) {
    backgroundColor = colors.border;
    textColor = colors.textTertiary;
  } else if (day.bothComplete) {
    backgroundColor = colors.success;
    textColor = '#FFFFFF';
  } else if (day.myComplete) {
    backgroundColor = '#3498DB';
    textColor = '#FFFFFF';
  } else if (day.partnerComplete) {
    backgroundColor = '#9B59B6';
    textColor = '#FFFFFF';
  } else {
    backgroundColor = '#EBEDF0';
    textColor = colors.textTertiary;
  }

  return {
    backgroundColor,
    textColor,
    borderWidth: isToday ? 2 : 0,
    borderColor: isToday ? colors.textPrimary : 'transparent',
  };
}

export function ChunkGrid({
  pairDayResults,
  myName,
  partnerName,
  dayNumber,
  chunkNumber,
  onDayPress,
}: ChunkGridProps) {
  const todayStr = getTodayDateString();

  const rows: PairDayResult[][] = [];
  for (let i = 0; i < 25; i += 5) {
    rows.push(pairDayResults.slice(i, i + 5));
  }

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Chunk {chunkNumber}</Text>

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((day, colIndex) => {
              const dayNum = rowIndex * 5 + colIndex + 1;
              const isToday = day.date === todayStr;
              const isFuture = day.date > todayStr;
              const cell = getCellStyle(day, isToday, isFuture);

              const canTap = !isFuture && onDayPress;

              return (
                <Pressable
                  key={day.date}
                  onPress={canTap ? () => onDayPress(day.date) : undefined}
                  disabled={!canTap}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: cell.backgroundColor,
                      borderWidth: cell.borderWidth,
                      borderColor: cell.borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      { color: cell.textColor },
                      isToday && styles.cellTextToday,
                    ]}
                  >
                    {dayNum}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendLabel}>Both</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3498DB' }]} />
          <Text style={styles.legendLabel}>{myName}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9B59B6' }]} />
          <Text style={styles.legendLabel}>{partnerName}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EBEDF0' }]} />
          <Text style={styles.legendLabel}>Missed</Text>
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
  header: {
    fontSize: typography.base.fontSize,
    lineHeight: typography.base.lineHeight,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  grid: {
    gap: GAP,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: typography.xs.fontSize,
    lineHeight: typography.xs.lineHeight,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  cellTextToday: {
    fontWeight: fontWeights.bold,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: typography.xs.fontSize,
    lineHeight: typography.xs.lineHeight,
    color: colors.textTertiary,
  },
});
