import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedInteraction } from '../../types/habit';
import { colors, typography, spacing } from '../../theme';

interface ReactionBarProps {
  interaction: FeedInteraction | null;
  currentUserId: string;
  onReact: (emoji: string) => void;
}

const QUICK_EMOJIS = ['\uD83D\uDD25', '\u2764\uFE0F', '\uD83D\uDC4F', '\uD83D\uDCAA', '\uD83C\uDF89'];

const FULL_EMOJI_SET = [
  // Faces
  '\uD83D\uDE00', '\uD83D\uDE02', '\uD83E\uDD23', '\uD83D\uDE0D', '\uD83E\uDD29',
  '\uD83D\uDE0E', '\uD83E\uDD73', '\uD83E\uDD7A', '\uD83D\uDE2D', '\uD83E\uDD2F',
  // Gestures
  '\uD83D\uDC4D', '\uD83D\uDC4F', '\uD83D\uDE4C', '\uD83D\uDCAA', '\u270C\uFE0F',
  '\uD83E\uDD1F', '\uD83E\uDD19', '\u261D\uFE0F', '\uD83D\uDC4C', '\uD83E\uDD1D',
  // Hearts & symbols
  '\u2764\uFE0F', '\uD83E\uDDE1', '\uD83D\uDC9B', '\uD83D\uDC9A', '\uD83D\uDC99',
  '\uD83D\uDC9C', '\uD83D\uDDA4', '\u2B50', '\uD83C\uDF1F', '\u2728',
  // Objects & nature
  '\uD83D\uDD25', '\uD83C\uDF89', '\uD83C\uDF8A', '\uD83C\uDFC6', '\uD83E\uDD47',
  '\uD83C\uDFAF', '\uD83D\uDCA5', '\uD83D\uDCAF', '\u26A1', '\uD83C\uDF08',
  // Food & activity
  '\u2615', '\uD83C\uDF4E', '\uD83C\uDFC3', '\uD83E\uDDD8', '\uD83D\uDECC',
  '\uD83D\uDCA4', '\uD83C\uDFB6', '\uD83D\uDCDA', '\u270D\uFE0F', '\uD83D\uDCA7',
];

export function ReactionBar({ interaction, currentUserId, onReact }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showFullGrid, setShowFullGrid] = useState(false);

  // Group reactions by emoji, tracking who reacted
  const emojiGroups: { emoji: string; users: string[]; hasOwn: boolean }[] = [];
  if (interaction?.reactions) {
    const groupMap = new Map<string, string[]>();
    for (const reaction of Object.values(interaction.reactions)) {
      const users = groupMap.get(reaction.emoji) || [];
      users.push(reaction.userId);
      groupMap.set(reaction.emoji, users);
    }
    for (const [emoji, users] of groupMap) {
      emojiGroups.push({
        emoji,
        users,
        hasOwn: users.includes(currentUserId),
      });
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    onReact(emoji);
    setShowPicker(false);
    setShowFullGrid(false);
  };

  return (
    <View style={styles.container}>
      {/* Applied reaction chips + add button */}
      <View style={styles.row}>
        {emojiGroups.map((group) => (
          <TouchableOpacity
            key={group.emoji}
            style={[styles.chip, group.hasOwn && styles.chipOwn]}
            onPress={() => onReact(group.emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipEmoji}>{group.emoji}</Text>
            {group.users.length > 1 && (
              <Text style={styles.chipCount}>{group.users.length}</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.addButton, showPicker && styles.addButtonActive]}
          onPress={() => { setShowPicker(!showPicker); setShowFullGrid(false); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPicker ? 'close' : 'happy-outline'}
            size={14}
            color={showPicker ? colors.textSecondary : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Emoji picker popup */}
      {showPicker && (
        <View style={styles.picker}>
          {!showFullGrid ? (
            <View style={styles.quickRow}>
              {QUICK_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.quickEmoji}
                  onPress={() => handleEmojiSelect(emoji)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.quickEmojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setShowFullGrid(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={22} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <ScrollView
                style={styles.gridScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <View style={styles.grid}>
                  {FULL_EMOJI_SET.map((emoji, i) => (
                    <TouchableOpacity
                      key={`${emoji}-${i}`}
                      style={styles.gridEmoji}
                      onPress={() => handleEmojiSelect(emoji)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.gridEmojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowFullGrid(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={12} color={colors.textTertiary} />
                <Text style={styles.backText}>Quick emojis</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipOwn: {
    borderColor: `${colors.textPrimary}25`,
    backgroundColor: `${colors.textPrimary}08`,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipCount: {
    ...typography.xs,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonActive: {
    backgroundColor: `${colors.textPrimary}08`,
    borderColor: `${colors.textPrimary}20`,
  },
  picker: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  quickEmoji: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  quickEmojiText: {
    fontSize: 20,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridScroll: {
    maxHeight: 180,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  gridEmoji: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridEmojiText: {
    fontSize: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backText: {
    ...typography.xs,
    color: colors.textTertiary,
  },
});
