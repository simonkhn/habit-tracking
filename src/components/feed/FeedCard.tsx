import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedEvent } from '../../types/habit';
import { ReactionBar } from './ReactionBar';
import { CommentSection } from './CommentSection';
import { AllCompleteCard } from './AllCompleteCard';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { format } from 'date-fns';

interface FeedCardProps {
  event: FeedEvent;
  currentUserId: string;
  userName: string;
  partnerName: string;
  onReact: (eventId: string, emoji: string) => void;
  onComment: (eventId: string, text: string) => void;
}

export function FeedCard({
  event,
  currentUserId,
  userName,
  partnerName,
  onReact,
  onComment,
}: FeedCardProps) {
  const { colors } = useTheme();

  if (event.habitType === 'allComplete') {
    return (
      <AllCompleteCard
        event={event}
        currentUserId={currentUserId}
        userName={userName}
        partnerName={partnerName}
        onReact={onReact}
        onComment={onComment}
      />
    );
  }

  const timeStr = format(event.completedAt, 'h:mm a');
  const isOwn = event.userId === currentUserId;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.accent, { backgroundColor: event.habitColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${event.habitColor}15` },
            ]}
          >
            <Ionicons
              name={event.habitIcon as any}
              size={20}
              color={event.habitColor}
            />
          </View>
          <View style={styles.textCol}>
            <Text style={[styles.flavorText, { color: colors.textPrimary }]}>{event.flavorText}</Text>
            <Text style={[styles.time, { color: colors.textTertiary }]}>{timeStr}</Text>
          </View>
        </View>

        <ReactionBar
          interaction={event.interaction}
          currentUserId={currentUserId}
          onReact={(emoji) => onReact(event.id, emoji)}
        />
        <CommentSection
          comments={event.interaction?.comments || []}
          currentUserId={currentUserId}
          userName={userName}
          partnerName={partnerName}
          onSubmit={(text) => onComment(event.id, text)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
  },
  flavorText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
  },
  time: {
    ...typography.xs,
    marginTop: 2,
  },
});
