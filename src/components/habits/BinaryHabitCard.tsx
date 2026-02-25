import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HabitDefinition, BinaryHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface BinaryHabitCardProps {
  definition: HabitDefinition;
  data: BinaryHabitData;
  onToggle: () => void;
}

const HOLD_DURATION = 500;

export function BinaryHabitCard({ definition, data, onToggle }: BinaryHabitCardProps) {
  const fillProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const isHolding = useRef(false);

  const triggerComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
    fillProgress.value = withTiming(0, { duration: 200 });
    cardScale.value = withSpring(1);
  }, [onToggle]);

  const handlePressIn = useCallback(() => {
    if (data.completed) return;
    isHolding.current = true;
    cardScale.value = withTiming(0.97, { duration: 100 });
    fillProgress.value = withTiming(1, { duration: HOLD_DURATION });

    holdTimer.current = setTimeout(() => {
      if (isHolding.current) {
        runOnJS(triggerComplete)();
      }
    }, HOLD_DURATION);
  }, [data.completed, triggerComplete]);

  const handlePressOut = useCallback(() => {
    isHolding.current = false;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (!data.completed) {
      fillProgress.value = withTiming(0, { duration: 150 });
    }
    cardScale.value = withSpring(1);
  }, [data.completed]);

  const handleTap = useCallback(() => {
    if (data.completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle();
    }
  }, [data.completed, onToggle]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
    backgroundColor: `${definition.color}26`, // 15% opacity
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleTap}
    >
      <Animated.View
        style={[
          styles.card,
          data.completed && styles.cardCompleted,
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
                data.completed && styles.labelCompleted,
              ]}
            >
              {definition.label}
            </Text>
            <Text style={styles.description}>{definition.description}</Text>
          </View>
          {data.completed && (
            <View
              style={[
                styles.checkmark,
                { backgroundColor: definition.color },
              ]}
            >
              <HabitIcon name="checkmark" size={16} color="#fff" />
            </View>
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
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
