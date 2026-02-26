import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedEvent } from '../../types/habit';
import { ReactionBar } from './ReactionBar';
import { CommentSection } from './CommentSection';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { format } from 'date-fns';

interface AllCompleteCardProps {
  event: FeedEvent;
  currentUserId: string;
  userName: string;
  partnerName: string;
  onReact: (eventId: string, emoji: string) => void;
  onComment: (eventId: string, text: string) => void;
}

export function AllCompleteCard({
  event,
  currentUserId,
  userName,
  partnerName,
  onReact,
  onComment,
}: AllCompleteCardProps) {
  const timeStr = format(event.completedAt, 'h:mm a');

  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.content}>
        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.flavorText}>{event.flavorText}</Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
        </View>

        <View style={styles.celebrationRow}>
          <Text style={styles.celebrationEmoji}>{'\uD83C\uDF89\uD83D\uDC51\u2B50'}</Text>
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
    borderColor: '#FFD70050',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  glow: {
    height: 3,
    backgroundColor: '#FFD700',
  },
  content: {
    padding: spacing.lg,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD70015',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
  },
  flavorText: {
    ...typography.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  time: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  celebrationRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  celebrationEmoji: {
    fontSize: 28,
    letterSpacing: 8,
  },
});
