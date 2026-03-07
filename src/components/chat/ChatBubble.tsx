import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { ChatMessage, ChatReplyTo } from '../../types/chat';
import { FeedInteraction } from '../../types/habit';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

const QUICK_EMOJIS = ['\u{1F525}', '\u2764\uFE0F', '\u{1F44F}', '\u{1F4AA}', '\u2705'];
const SWIPE_MAX = 80;
const SWIPE_THRESHOLD = 60;

const BUBBLE_RADIUS = 16;
const BUBBLE_RADIUS_GROUPED = 4;
const BUBBLE_TAIL_RADIUS = 4;

interface ChatBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  senderName: string;
  reactions: FeedInteraction | null;
  currentUserId: string;
  onReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showTimestamp: boolean;
}

function getDisplayText(text: string): string {
  if (text.startsWith('#idea ')) return text.slice(6);
  if (text.startsWith('#bug ')) return text.slice(5);
  return text;
}

function formatTime(timestamp: ChatMessage['timestamp']): string {
  if (!timestamp?.toDate) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

/** Group reactions by emoji, counting duplicates and tracking which users reacted. */
function groupReactions(
  reactions: FeedInteraction['reactions'],
): { emoji: string; count: number; userIds: string[] }[] {
  const map = new Map<string, string[]>();
  for (const [_key, reaction] of Object.entries(reactions)) {
    const existing = map.get(reaction.emoji);
    if (existing) {
      existing.push(reaction.userId);
    } else {
      map.set(reaction.emoji, [reaction.userId]);
    }
  }
  return Array.from(map.entries()).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
    userIds,
  }));
}

function getBubbleRadii(isMe: boolean, isFirstInGroup: boolean, isLastInGroup: boolean) {
  // Base: all corners rounded
  let topLeft = BUBBLE_RADIUS;
  let topRight = BUBBLE_RADIUS;
  let bottomLeft = BUBBLE_RADIUS;
  let bottomRight = BUBBLE_RADIUS;

  if (isMe) {
    // For "me" bubbles, the tail is bottom-right
    if (!isFirstInGroup) {
      topRight = BUBBLE_RADIUS_GROUPED;
    }
    if (!isLastInGroup) {
      bottomRight = BUBBLE_RADIUS_GROUPED;
    } else {
      bottomRight = BUBBLE_TAIL_RADIUS;
    }
  } else {
    // For partner bubbles, the tail is bottom-left
    if (!isFirstInGroup) {
      topLeft = BUBBLE_RADIUS_GROUPED;
    }
    if (!isLastInGroup) {
      bottomLeft = BUBBLE_RADIUS_GROUPED;
    } else {
      bottomLeft = BUBBLE_TAIL_RADIUS;
    }
  }

  return {
    borderTopLeftRadius: topLeft,
    borderTopRightRadius: topRight,
    borderBottomLeftRadius: bottomLeft,
    borderBottomRightRadius: bottomRight,
  };
}

export function ChatBubble({
  message,
  isMe,
  senderName,
  reactions,
  currentUserId,
  onReply,
  onDelete,
  onReact,
  isFirstInGroup,
  isLastInGroup,
  showTimestamp,
}: ChatBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const translateX = useSharedValue(0);
  const displayText = getDisplayText(message.text);

  // --- Swipe-to-reply gesture ---
  const triggerReply = () => {
    onReply(message);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX(15)
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      const clamped = Math.min(Math.max(e.translationX, 0), SWIPE_MAX);
      translateX.value = clamped;
    })
    .onEnd(() => {
      if (translateX.value >= SWIPE_THRESHOLD) {
        runOnJS(triggerReply)();
      }
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    });

  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const replyIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 60], [0, 1]),
  }));

  // --- Reaction chips ---
  const grouped = reactions?.reactions ? groupReactions(reactions.reactions) : [];

  const bubbleRadii = getBubbleRadii(isMe, isFirstInGroup, isLastInGroup);
  const verticalMargin = isLastInGroup ? spacing.xs : 2;

  return (
    <View
      style={[
        styles.row,
        isMe ? styles.rowMe : styles.rowPartner,
        { marginBottom: verticalMargin, marginTop: isFirstInGroup ? spacing.xs : 0 },
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.swipeContainer,
            isMe ? styles.swipeContainerMe : styles.swipeContainerPartner,
          ]}
        >
          {/* Reply arrow behind the bubble */}
          <Animated.View
            style={[
              styles.replyIcon,
              replyIconAnimatedStyle,
            ]}
          >
            <Ionicons name="return-down-back" size={20} color={colors.textTertiary} />
          </Animated.View>

          {/* Sliding bubble content */}
          <Animated.View style={[styles.bubbleWrapper, bubbleAnimatedStyle]}>
            <Pressable
              onLongPress={() => setShowMenu(true)}
              delayLongPress={400}
              onPress={() => {
                if (showMenu) setShowMenu(false);
              }}
            >
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleMe : styles.bubblePartner,
                  bubbleRadii,
                ]}
              >
                {/* Sender name + tag inline for partner; tag only for me */}
                {((!isMe && isFirstInGroup) || message.tag) && (
                  <View style={styles.nameTagRow}>
                    {!isMe && isFirstInGroup && (
                      <Text style={styles.senderName}>{senderName}</Text>
                    )}
                    {message.tag && (
                      <View
                        style={[
                          styles.tagPill,
                          message.tag === 'idea' ? styles.tagIdea : styles.tagBug,
                        ]}
                      >
                        <Ionicons
                          name={message.tag === 'idea' ? 'bulb-outline' : 'bug-outline'}
                          size={12}
                          color={message.tag === 'idea' ? '#2563EB' : '#DC2626'}
                        />
                        <Text
                          style={[
                            styles.tagText,
                            message.tag === 'idea' ? styles.tagTextIdea : styles.tagTextBug,
                          ]}
                        >
                          {message.tag === 'idea' ? 'Idea' : 'Bug'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Reply preview */}
                {message.replyTo && (
                  <View
                    style={[
                      styles.replyPreview,
                      isMe ? styles.replyPreviewMe : styles.replyPreviewPartner,
                    ]}
                  >
                    <Text
                      style={[
                        styles.replyPreviewSender,
                        isMe && styles.replyPreviewSenderMe,
                      ]}
                    >
                      {message.replyTo.userName}
                    </Text>
                    <Text
                      style={[
                        styles.replyPreviewText,
                        isMe && styles.replyPreviewTextMe,
                      ]}
                      numberOfLines={2}
                    >
                      {truncateText(message.replyTo.text, 60)}
                    </Text>
                  </View>
                )}

                <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                  {displayText}
                </Text>

                {showTimestamp && (
                  <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
                    {formatTime(message.timestamp)}
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Reaction chips */}
            {grouped.length > 0 && (
              <View
                style={[
                  styles.reactionRow,
                  isMe ? styles.reactionRowMe : styles.reactionRowPartner,
                ]}
              >
                {grouped.map(({ emoji, count, userIds }) => {
                  const iReacted = userIds.includes(currentUserId);
                  return (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.reactionChip,
                        iReacted && styles.reactionChipActive,
                      ]}
                      onPress={() => onReact(message.id, emoji)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      {count > 1 && (
                        <Text style={styles.reactionCount}>{count}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Context menu as Modal overlay */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowMenu(false)}>
          <Pressable style={styles.modalMenu} onPress={(e) => e.stopPropagation()}>
            {/* Quick emoji row */}
            <View style={styles.emojiRow}>
              {QUICK_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiButton}
                  onPress={() => {
                    onReact(message.id, emoji);
                    setShowMenu(false);
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.menuActions}>
              <TouchableOpacity
                style={styles.menuAction}
                onPress={() => {
                  onReply(message);
                  setShowMenu(false);
                }}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-undo-outline" size={16} color={colors.textPrimary} />
                <Text style={styles.menuActionText}>Reply</Text>
              </TouchableOpacity>

              {isMe && (
                <TouchableOpacity
                  style={styles.menuAction}
                  onPress={() => {
                    onDelete(message.id);
                    setShowMenu(false);
                  }}
                  activeOpacity={0.6}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={[styles.menuActionText, { color: colors.error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.sm,
  },
  rowMe: {
    alignItems: 'flex-end',
  },
  rowPartner: {
    alignItems: 'flex-start',
  },
  swipeContainer: {
    maxWidth: '80%',
    position: 'relative',
  },
  swipeContainerMe: {
    alignItems: 'flex-end',
  },
  swipeContainerPartner: {
    alignItems: 'flex-start',
  },
  replyIcon: {
    position: 'absolute',
    top: '50%',
    left: -28,
    marginTop: -10,
    zIndex: -1,
  },
  bubbleWrapper: {
    // No width constraint here -- the bubble itself sizes to content
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMe: {
    backgroundColor: '#3B82F6',
  },
  bubblePartner: {
    backgroundColor: '#F3F4F6',
  },

  // Name + tag inline row
  nameTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  senderName: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },

  // Reply preview inside bubble
  replyPreview: {
    borderLeftWidth: 2,
    paddingLeft: spacing.sm,
    marginBottom: spacing.xs,
    paddingVertical: 2,
    borderRadius: 2,
  },
  replyPreviewMe: {
    borderLeftColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  replyPreviewPartner: {
    borderLeftColor: colors.textTertiary,
    backgroundColor: '#E5E7EB',
  },
  replyPreviewSender: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  replyPreviewSenderMe: {
    color: 'rgba(255,255,255,0.8)',
  },
  replyPreviewText: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },
  replyPreviewTextMe: {
    color: 'rgba(255,255,255,0.6)',
  },

  // Tag pill
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagIdea: {
    backgroundColor: '#DBEAFE',
  },
  tagBug: {
    backgroundColor: '#FEE2E2',
  },
  tagText: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
  },
  tagTextIdea: {
    color: '#2563EB',
  },
  tagTextBug: {
    color: '#DC2626',
  },

  // Message text
  messageText: {
    ...typography.sm,
    color: colors.textPrimary,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  timestamp: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 4,
  },
  timestampMe: {
    color: 'rgba(255,255,255,0.6)',
  },

  // Modal context menu
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMenu: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  menuActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  menuActionText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },

  // Reaction chips
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  reactionRowMe: {
    justifyContent: 'flex-end',
  },
  reactionRowPartner: {
    justifyContent: 'flex-start',
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  reactionChipActive: {
    borderColor: colors.water,
    backgroundColor: '#EBF5FB',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
});
