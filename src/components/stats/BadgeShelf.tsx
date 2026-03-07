import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import { EarnedBadge, BadgeId } from '../../types/stats';
import { BADGE_DEFINITIONS } from '../../config/badges';
import { colors, typography, fontWeights, spacing } from '../../theme';

interface BadgeShelfProps {
  earnedBadges: EarnedBadge[];
  dayNumber: number;
  bestHabitStreak: number;
  pairStreak: number;
  longestPairStreak: number;
  hasPerfectPairDay: boolean;
}

const ICON_SIZE = 48;
const RING_SIZE = 56;
const RING_STROKE = 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const CHECKMARK_SIZE = 16;

function getProgressTarget(badgeId: BadgeId): { key: 'day' | 'streak' | 'perfectPair' | 'unstoppable'; target: number } {
  switch (badgeId) {
    case 'day7': return { key: 'day', target: 7 };
    case 'day14': return { key: 'day', target: 14 };
    case 'day25': return { key: 'day', target: 25 };
    case 'day50': return { key: 'day', target: 50 };
    case 'day75': return { key: 'day', target: 75 };
    case 'streak7': return { key: 'streak', target: 7 };
    case 'streak14': return { key: 'streak', target: 14 };
    case 'streak25': return { key: 'streak', target: 25 };
    case 'perfectPair': return { key: 'perfectPair', target: 1 };
    case 'unstoppable7': return { key: 'unstoppable', target: 7 };
  }
}

function computeProgress(
  badgeId: BadgeId,
  props: Omit<BadgeShelfProps, 'earnedBadges'>,
): { progress: number; current: number; target: number } {
  const { key, target } = getProgressTarget(badgeId);
  let current: number;

  switch (key) {
    case 'day':
      current = props.dayNumber;
      break;
    case 'streak':
      current = props.bestHabitStreak;
      break;
    case 'perfectPair':
      current = props.hasPerfectPairDay ? 1 : 0;
      break;
    case 'unstoppable':
      current = props.longestPairStreak;
      break;
  }

  return {
    progress: Math.min(current / target, 1),
    current: Math.min(current, target),
    target,
  };
}

export function BadgeShelf({
  earnedBadges,
  dayNumber,
  bestHabitStreak,
  pairStreak,
  longestPairStreak,
  hasPerfectPairDay,
}: BadgeShelfProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));
  const progressProps = { dayNumber, bestHabitStreak, pairStreak, longestPairStreak, hasPerfectPairDay };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Badges</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {BADGE_DEFINITIONS.map((def) => {
          const earned = earnedIds.has(def.id);
          const { progress, current, target } = computeProgress(def.id, progressProps);
          const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

          return (
            <View key={def.id} style={styles.badgeItem}>
              {/* Icon with optional progress ring or checkmark */}
              <View style={styles.iconWrapper}>
                {!earned && (
                  <Svg
                    width={RING_SIZE}
                    height={RING_SIZE}
                    style={styles.progressRing}
                  >
                    {/* Background track */}
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      stroke={colors.border}
                      strokeWidth={RING_STROKE}
                      fill="none"
                    />
                    {/* Progress arc */}
                    {progress > 0 && (
                      <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke={`${def.color}99`}
                        strokeWidth={RING_STROKE}
                        fill="none"
                        strokeDasharray={`${RING_CIRCUMFERENCE}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                      />
                    )}
                  </Svg>
                )}

                <View
                  style={[
                    styles.iconCircle,
                    earned
                      ? { backgroundColor: `${def.color}1A` }
                      : { backgroundColor: colors.border },
                  ]}
                >
                  <Ionicons
                    name={def.icon as any}
                    size={24}
                    color={earned ? def.color : colors.textTertiary}
                  />
                </View>

                {/* Checkmark overlay for earned badges */}
                {earned && (
                  <View style={styles.checkmarkBadge}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  earned
                    ? { color: colors.textPrimary }
                    : { color: colors.textTertiary },
                ]}
                numberOfLines={2}
              >
                {def.label}
              </Text>

              {/* Progress fraction for unearned badges */}
              {!earned && (
                <Text style={styles.progressText}>
                  {current}/{target}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  badgeItem: {
    width: 72,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  iconWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CHECKMARK_SIZE,
    height: CHECKMARK_SIZE,
    borderRadius: CHECKMARK_SIZE / 2,
    backgroundColor: '#27AE60',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  label: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.xs,
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
});
