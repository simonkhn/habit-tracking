import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { PairDayResult } from '../../types/stats';

interface ChunkGridProps {
  pairDayResults: PairDayResult[];
  myName: string;
  partnerName: string;
  dayNumber: number;
  chunkNumber: number;
  onDayPress?: (date: string) => void;
  today: string;
}

const CELL_SIZE = 48;
const GAP = spacing.sm;

export function ChunkGrid({
  pairDayResults,
  myName,
  partnerName,
  dayNumber,
  chunkNumber,
  onDayPress,
  today,
}: ChunkGridProps) {
  const { colors } = useTheme();
  const todayStr = today;

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
      backgroundColor = colors.water;
      textColor = '#FFFFFF';
    } else if (day.partnerComplete) {
      backgroundColor = colors.journal;
      textColor = '#FFFFFF';
    } else {
      backgroundColor = colors.chunkMissed;
      textColor = colors.textTertiary;
    }

    return {
      backgroundColor,
      textColor,
      borderWidth: isToday ? 2 : 0,
      borderColor: isToday ? colors.textPrimary : 'transparent',
    };
  }

  const rows: PairDayResult[][] = [];
  for (let i = 0; i < 25; i += 5) {
    rows.push(pairDayResults.slice(i, i + 5));
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>Chunk {chunkNumber}</Text>

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
          <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>Both</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.water }]} />
          <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>{myName}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.journal }]} />
          <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>{partnerName}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.chunkMissed }]} />
          <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>Missed</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
  },
  header: {
    fontSize: typography.base.fontSize,
    lineHeight: typography.base.lineHeight,
    fontWeight: fontWeights.semibold,
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
  },
});
