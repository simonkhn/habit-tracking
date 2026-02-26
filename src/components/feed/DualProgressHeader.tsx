import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DayHabits, WaterHabitData, ReadingHabitData } from '../../types/habit';
import { HABIT_ORDER, getHabitDefinition } from '../../config/habits';
import { Card } from '../ui/Card';
import { colors, typography, fontWeights, spacing } from '../../theme';

interface ProgressSideProps {
  name: string;
  habits: DayHabits | null;
  completedCount: number;
  totalHabits: number;
  expanded: boolean;
}

function ProgressSide({ name, habits, completedCount, totalHabits, expanded }: ProgressSideProps) {
  const progress = totalHabits > 0 ? completedCount / totalHabits : 0;

  return (
    <View style={styles.side}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.count}>
          {completedCount}/{totalHabits}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: completedCount === totalHabits ? colors.success : colors.textPrimary,
            },
          ]}
        />
      </View>
      {habits && (
        <>
          <View style={styles.dots}>
            {HABIT_ORDER.map((id) => {
              const def = getHabitDefinition(id);
              const completed = habits[id]?.completed;
              return (
                <View
                  key={id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: completed ? def.color : `${def.color}15`,
                    },
                  ]}
                />
              );
            })}
          </View>

          {expanded && (
            <View style={styles.habitList}>
              {HABIT_ORDER.map((id) => {
                const def = getHabitDefinition(id);
                const completed = habits[id]?.completed;
                let detail = '';
                if (id === 'water') {
                  const oz = (habits[id] as WaterHabitData).currentOz || 0;
                  detail = ` — ${oz}oz`;
                } else if (id === 'reading') {
                  const pages = (habits[id] as ReadingHabitData).pagesRead || 0;
                  detail = ` — ${pages}p`;
                }
                return (
                  <View key={id} style={styles.habitRow}>
                    <View style={[styles.habitDot, { backgroundColor: completed ? def.color : `${def.color}15` }]} />
                    <Text style={[styles.habitLabel, !completed && styles.habitLabelIncomplete]}>
                      {def.label}{detail}
                    </Text>
                    {completed && (
                      <Ionicons name="checkmark" size={12} color={colors.success} style={styles.check} />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
}

interface DualProgressHeaderProps {
  myName: string;
  partnerName: string;
  myHabits: DayHabits | null;
  partnerHabits: DayHabits | null;
  myCompletedCount: number;
  partnerCompletedCount: number;
  totalHabits: number;
}

export function DualProgressHeader({
  myName,
  partnerName,
  myHabits,
  partnerHabits,
  myCompletedCount,
  partnerCompletedCount,
  totalHabits,
}: DualProgressHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => setExpanded(!expanded)}>
      <Card style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Today's Progress</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textTertiary}
          />
        </View>
        <View style={styles.sides}>
          <ProgressSide
            name={myName}
            habits={myHabits}
            completedCount={myCompletedCount}
            totalHabits={totalHabits}
            expanded={expanded}
          />
          <View style={styles.divider} />
          <ProgressSide
            name={partnerName}
            habits={partnerHabits}
            completedCount={partnerCompletedCount}
            totalHabits={totalHabits}
            expanded={expanded}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sides: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  side: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
    marginHorizontal: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  count: {
    ...typography.sm,
    fontWeight: fontWeights.bold,
    color: colors.textSecondary,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  habitList: {
    marginTop: spacing.sm,
    gap: 4,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  habitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  habitLabel: {
    ...typography.xs,
    color: colors.textPrimary,
    flex: 1,
  },
  habitLabelIncomplete: {
    color: colors.textTertiary,
  },
  check: {
    marginLeft: 2,
  },
});
