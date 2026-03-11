import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const HOLD_DURATION = 500;

interface UseHoldToCompleteOptions {
  completed: boolean;
  onComplete: () => void;
  onUndo?: () => void;
  color: string;
}

export function useHoldToComplete({
  completed,
  onComplete,
  onUndo,
  color,
}: UseHoldToCompleteOptions) {
  const fillProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const isHolding = useRef(false);
  const justCompleted = useRef(false);

  const triggerComplete = useCallback(() => {
    justCompleted.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
    fillProgress.value = withTiming(0, { duration: 200 });
    cardScale.value = withSpring(1);
  }, [onComplete]);

  const onPressIn = useCallback(() => {
    if (completed) return;
    isHolding.current = true;
    cardScale.value = withTiming(0.97, { duration: 100 });
    fillProgress.value = withTiming(1, { duration: HOLD_DURATION });

    holdTimer.current = setTimeout(() => {
      if (isHolding.current) {
        runOnJS(triggerComplete)();
      }
    }, HOLD_DURATION);
  }, [completed, triggerComplete]);

  const onPressOut = useCallback(() => {
    isHolding.current = false;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (!completed) {
      fillProgress.value = withTiming(0, { duration: 150 });
    }
    cardScale.value = withSpring(1);
  }, [completed]);

  const onPress = useCallback(() => {
    if (justCompleted.current) {
      justCompleted.current = false;
      return;
    }
    if (completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onUndo) {
        onUndo();
      } else {
        onComplete();
      }
    }
  }, [completed, onComplete, onUndo]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
    backgroundColor: `${color}26`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return {
    fillStyle,
    cardAnimStyle,
    pressHandlers: { onPressIn, onPressOut, onPress },
  };
}
