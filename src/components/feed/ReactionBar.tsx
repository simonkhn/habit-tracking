import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FeedInteraction, ReactionEmoji, REACTION_EMOJIS } from '../../types/habit';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface ReactionBarProps {
  interaction: FeedInteraction | null;
  currentUserId: string;
  onReact: (emoji: ReactionEmoji) => void;
}

export function ReactionBar({ interaction, currentUserId, onReact }: ReactionBarProps) {
  const myReaction = interaction?.reactions?.[currentUserId]?.emoji;

  // Collect all reactions (from both users)
  const appliedReactions: { emoji: string; key: ReactionEmoji; isOwn: boolean }[] = [];
  if (interaction?.reactions) {
    for (const [uid, reaction] of Object.entries(interaction.reactions)) {
      const emojiDef = REACTION_EMOJIS.find((e) => e.key === reaction.emoji);
      if (emojiDef) {
        appliedReactions.push({
          emoji: emojiDef.emoji,
          key: reaction.emoji,
          isOwn: uid === currentUserId,
        });
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Quick reaction buttons */}
      <View style={styles.emojiRow}>
        {REACTION_EMOJIS.map(({ key, emoji }) => {
          const isActive = myReaction === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.emojiButton, isActive && styles.emojiButtonActive]}
              onPress={() => onReact(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Show applied reactions summary */}
      {appliedReactions.length > 0 && (
        <View style={styles.appliedRow}>
          {appliedReactions.map((r, i) => (
            <Text key={i} style={[styles.appliedEmoji, r.isOwn && styles.appliedOwn]}>
              {r.emoji}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  emojiButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  emojiButtonActive: {
    backgroundColor: `${colors.textPrimary}15`,
    borderWidth: 1,
    borderColor: `${colors.textPrimary}30`,
  },
  emoji: {
    fontSize: 18,
  },
  appliedRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  appliedEmoji: {
    fontSize: 14,
  },
  appliedOwn: {
    opacity: 0.7,
  },
});
