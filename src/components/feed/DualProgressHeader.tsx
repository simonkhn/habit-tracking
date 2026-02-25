import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayHabits } from '../../types/habit';
import { HABIT_ORDER, getHabitDefinition } from '../../config/habits';
import { Card } from '../ui/Card';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface ProgressSideProps {
  name: string;
  habits: DayHabits | null;
  completedCount: number;
  totalHabits: number;
}

function ProgressSide({ name, habits, completedCount, totalHabits }: ProgressSideProps) {
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
                    backgroundColor: completed ? def.color : `${def.color}30`,
                  },
                ]}
              />
            );
          })}
        </View>
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
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Today's Progress</Text>
      <View style={styles.sides}>
        <ProgressSide
          name={myName}
          habits={myHabits}
          completedCount={myCompletedCount}
          totalHabits={totalHabits}
        />
        <View style={styles.divider} />
        <ProgressSide
          name={partnerName}
          habits={partnerHabits}
          completedCount={partnerCompletedCount}
          totalHabits={totalHabits}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
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
});
