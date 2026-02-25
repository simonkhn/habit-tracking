import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedEvent, ReactionEmoji } from '../../types/habit';
import { ReactionBar } from './ReactionBar';
import { CommentSection } from './CommentSection';
import { AllCompleteCard } from './AllCompleteCard';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { format } from 'date-fns';

interface FeedCardProps {
  event: FeedEvent;
  currentUserId: string;
  userName: string;
  partnerName: string;
  onReact: (eventId: string, emoji: ReactionEmoji) => void;
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
    <View style={styles.card}>
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
            <Text style={styles.flavorText}>{event.flavorText}</Text>
            <Text style={styles.time}>{timeStr}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
  },
  time: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
