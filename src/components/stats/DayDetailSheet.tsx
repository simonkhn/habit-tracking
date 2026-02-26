import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { HabitLog, HabitId, DayHabits, WaterHabitData, ReadingHabitData, WorkoutHabitData } from '../../types/habit';
import { HABIT_ORDER, getHabitDefinition, READING_TARGET_PAGES } from '../../config/habits';
import { HabitIcon } from '../habits/HabitIcon';
import { formatDateHeader } from '../../utils/dates';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface DayDetailSheetProps {
  visible: boolean;
  date: string;
  myName: string;
  partnerName: string;
  myLog: HabitLog | undefined;
  partnerLog: HabitLog | undefined;
  myWaterTarget: number;
  partnerWaterTarget: number;
  dayLabel: string;
  onClose: () => void;
}

function getHabitDetail(habitId: HabitId, habits: DayHabits | undefined, waterTarget: number): string {
  if (!habits) return '';
  const data = habits[habitId];
  if (!data) return '';

  if (habitId === 'water') {
    const w = data as WaterHabitData;
    return `${w.currentOz ?? 0}/${waterTarget} oz`;
  }
  if (habitId === 'reading') {
    const r = data as ReadingHabitData;
    return `${r.pagesRead ?? 0}/${READING_TARGET_PAGES} pg`;
  }
  if (habitId === 'workout' && data.completed) {
    const w = data as WorkoutHabitData;
    return w.note || '';
  }
  return '';
}

function HabitRow({ habitId, habits, waterTarget }: { habitId: HabitId; habits: DayHabits | undefined; waterTarget: number }) {
  const def = getHabitDefinition(habitId);
  const completed = habits?.[habitId]?.completed ?? false;
  const detail = getHabitDetail(habitId, habits, waterTarget);

  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.statusContainer}>
        {completed ? (
          <View style={[rowStyles.checkCircle, { backgroundColor: def.color }]}>
            <HabitIcon name="checkmark" size={10} color="#fff" />
          </View>
        ) : (
          <View style={rowStyles.missCircle} />
        )}
      </View>
      {detail ? (
        <Text style={rowStyles.detail} numberOfLines={1}>{detail}</Text>
      ) : null}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  statusContainer: {
    width: 20,
    alignItems: 'center',
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
  },
  detail: {
    ...typography.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
});

export function DayDetailSheet({
  visible,
  date,
  myName,
  partnerName,
  myLog,
  partnerLog,
  myWaterTarget,
  partnerWaterTarget,
  dayLabel,
  onClose,
}: DayDetailSheetProps) {
  const myHabits = myLog?.habits;
  const partnerHabits = partnerLog?.habits;
  const myCount = myHabits
    ? HABIT_ORDER.filter((id) => myHabits[id]?.completed).length
    : 0;
  const partnerCount = partnerHabits
    ? HABIT_ORDER.filter((id) => partnerHabits[id]?.completed).length
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.dateHeader}>{formatDateHeader(date)}</Text>
        <Text style={styles.dayLabel}>{dayLabel}</Text>

        {/* Column headers */}
        <View style={styles.tableHeader}>
          <Text style={styles.habitColHeader}>Habit</Text>
          <Text style={styles.userColHeader}>{myName}</Text>
          <Text style={styles.userColHeader}>{partnerName}</Text>
        </View>

        <ScrollView style={styles.tableBody} bounces={false}>
          {HABIT_ORDER.map((habitId) => {
            const def = getHabitDefinition(habitId);
            return (
              <View key={habitId} style={styles.tableRow}>
                <View style={styles.habitCol}>
                  <View style={[styles.iconContainer, { backgroundColor: `${def.color}1A` }]}>
                    <HabitIcon name={def.icon} size={14} color={def.color} />
                  </View>
                  <Text style={styles.habitLabel} numberOfLines={1}>{def.label}</Text>
                </View>
                <View style={styles.userCol}>
                  <HabitRow habitId={habitId} habits={myHabits} waterTarget={myWaterTarget} />
                </View>
                <View style={styles.userCol}>
                  <HabitRow habitId={habitId} habits={partnerHabits} waterTarget={partnerWaterTarget} />
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{myCount}/{HABIT_ORDER.length}</Text>
          <Text style={styles.summaryValue}>{partnerCount}/{HABIT_ORDER.length}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  dateHeader: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  dayLabel: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitColHeader: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
    flex: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userColHeader: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textTertiary,
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBody: {
    marginTop: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitCol: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  habitLabel: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  userCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    flex: 2,
  },
  summaryValue: {
    ...typography.sm,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
});
