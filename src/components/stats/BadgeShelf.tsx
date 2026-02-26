import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { EarnedBadge } from '../../types/stats';
import { BADGE_DEFINITIONS } from '../../config/badges';
import { colors, typography, fontWeights, spacing } from '../../theme';

interface BadgeShelfProps {
  earnedBadges: EarnedBadge[];
}

export function BadgeShelf({ earnedBadges }: BadgeShelfProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Badges</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {BADGE_DEFINITIONS.map((def) => {
          const earned = earnedIds.has(def.id);

          return (
            <View
              key={def.id}
              style={[styles.badgeItem, !earned && styles.unearned]}
            >
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
              <Text
                style={[
                  styles.label,
                  earned
                    ? { color: colors.textPrimary }
                    : { color: colors.textTertiary },
                ]}
                numberOfLines={2}
              >
                {earned ? def.label : '???'}
              </Text>
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
  unearned: {
    opacity: 0.4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
