import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { HabitDefinition, HabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { useHoldToComplete } from '../../hooks/useHoldToComplete';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface BinaryHabitCardProps {
  definition: HabitDefinition;
  data: HabitData;
  onToggle: () => void;
}

export function BinaryHabitCard({ definition, data, onToggle }: BinaryHabitCardProps) {
  const { colors } = useTheme();
  const completed = data?.completed ?? false;

  const { fillStyle, cardAnimStyle, pressHandlers } = useHoldToComplete({
    completed,
    onComplete: onToggle,
    color: definition.color,
  });

  return (
    <Pressable {...pressHandlers}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          completed && styles.cardCompleted,
          cardAnimStyle,
        ]}
      >
        <Animated.View style={[styles.fillOverlay, fillStyle]} />
        <View style={styles.row}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${definition.color}1A` },
            ]}
          >
            <HabitIcon
              name={definition.icon}
              size={22}
              color={definition.color}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                { color: colors.textPrimary },
                completed && [styles.labelCompleted, { color: colors.textTertiary }],
              ]}
            >
              {definition.label}
            </Text>
            <Text style={[styles.description, { color: colors.textTertiary }]}>{definition.description}</Text>
          </View>
          {completed && (
            <>
              <Text style={[styles.undoLabel, { color: colors.textTertiary }]}>Undo</Text>
              <View
                style={[
                  styles.checkmark,
                  { backgroundColor: definition.color },
                ]}
              >
                <HabitIcon name="checkmark" size={16} color={colors.textOnPrimary} />
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCompleted: {
    opacity: 0.7,
  },
  fillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: borderRadius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    ...typography.sm,
    marginTop: 2,
  },
  undoLabel: {
    ...typography.xs,
    marginRight: spacing.xs,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
