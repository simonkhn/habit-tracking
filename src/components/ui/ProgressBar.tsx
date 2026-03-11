import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, borderRadius } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color,
  height = 8,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const fillColor = color ?? colors.success;
  const clamped = Math.min(1, Math.max(0, progress));

  const animatedProgress = useSharedValue(clamped);

  useEffect(() => {
    animatedProgress.value = withSpring(clamped, {
      damping: 15,
      stiffness: 120,
    });
  }, [clamped]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.border }, style]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: fillColor, borderRadius: height / 2 },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
