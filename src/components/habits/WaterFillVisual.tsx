import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, borderRadius } from '../../theme';

interface WaterFillVisualProps {
  progress: number; // 0-1
  height?: number;
}

export function WaterFillVisual({ progress, height = 80 }: WaterFillVisualProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  const fillStyle = useAnimatedStyle(() => ({
    height: withSpring(`${clamped * 100}%` as any, {
      damping: 15,
      stiffness: 100,
    }),
  }));

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: `${colors.water}15`,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    backgroundColor: `${colors.water}40`,
    borderRadius: borderRadius.sm,
  },
});
