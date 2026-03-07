import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PersonalHabitDefinition, HabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface PersonalHabitCardProps {
  definition: PersonalHabitDefinition;
  data: HabitData | undefined;
  onToggle: () => void;
}

const HOLD_DURATION = 500;

export function PersonalHabitCard({ definition, data, onToggle }: PersonalHabitCardProps) {
  const completed = data?.completed ?? false;
  const fillProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);

  // RNGH Pressable: onPress does NOT fire after onLongPress, so no guard needed
  const handleLongPress = useCallback(() => {
    if (completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
    fillProgress.value = withTiming(0, { duration: 200 });
    cardScale.value = withSpring(1);
  }, [completed, onToggle]);

  const handlePressIn = useCallback(() => {
    if (completed) return;
    cardScale.value = withTiming(0.97, { duration: 100 });
    fillProgress.value = withTiming(1, { duration: HOLD_DURATION });
  }, [completed]);

  const handlePressOut = useCallback(() => {
    if (!completed) {
      fillProgress.value = withTiming(0, { duration: 150 });
    }
    cardScale.value = withSpring(1);
  }, [completed]);

  const handlePress = useCallback(() => {
    if (completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle();
    }
  }, [completed, onToggle]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
    backgroundColor: `${definition.color}26`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={HOLD_DURATION}
    >
      <Animated.View
        style={[
          styles.card,
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
                completed && styles.labelCompleted,
              ]}
            >
              {definition.label}
            </Text>
            <Text style={styles.description}>Personal</Text>
          </View>
          {completed && (
            <>
              <Text style={styles.undoLabel}>Undo</Text>
              <View
                style={[
                  styles.checkmark,
                  { backgroundColor: definition.color },
                ]}
              >
                <HabitIcon name="checkmark" size={16} color="#fff" />
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  description: {
    ...typography.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  undoLabel: {
    ...typography.xs,
    color: colors.textTertiary,
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
