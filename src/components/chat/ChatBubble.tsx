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
import { ChatMessage, ChatReplyTo, ChatTag } from '../../types/chat';
import { FeedInteraction } from '../../types/habit';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';

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
  onEdit: (message: ChatMessage) => void;
  onResolve: (messageId: string, resolved: boolean) => void;
  onScrollToMessage?: (messageId: string) => void;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showTimestamp: boolean;
}

function getDisplayText(text: string, tag: ChatTag | null): string {
  if (!tag) return text;
  return text.replace(/#(?:idea|bug)\b/gi, '').trim();
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
  onEdit,
  onResolve,
  onScrollToMessage,
  isFirstInGroup,
  isLastInGroup,
  showTimestamp,
}: ChatBubbleProps) {
  const { colors } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const translateX = useSharedValue(0);
  const displayText = getDisplayText(message.text, message.tag);

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
                  { backgroundColor: isMe ? colors.chatBubbleMe : colors.chatBubblePartner },
                  bubbleRadii,
                  message.resolved && styles.bubbleResolved,
                ]}
              >
                {/* Sender name + tag for partner; tag only inline for own messages */}
                {!isMe && (isFirstInGroup || message.tag) && (
                  <View style={styles.nameTagRow}>
                    {isFirstInGroup && (
                      <Text style={[styles.senderName, { color: colors.textSecondary }]}>{senderName}</Text>
                    )}
                    {message.tag && (
                      <View
                        style={[
                          styles.tagPill,
                          { backgroundColor: message.tag === 'idea' ? colors.chatTagIdeaBg : colors.chatTagBugBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            { color: message.tag === 'idea' ? colors.chatTagIdeaText : colors.chatTagBugText },
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
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onScrollToMessage?.(message.replyTo!.id)}
                    style={[
                      styles.replyPreview,
                      isMe ? styles.replyPreviewMe : { borderLeftColor: colors.textTertiary, backgroundColor: '#E5E7EB' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.replyPreviewSender,
                        { color: colors.textSecondary },
                        isMe && styles.replyPreviewSenderMe,
                      ]}
                    >
                      {message.replyTo.userName}
                    </Text>
                    <Text
                      style={[
                        styles.replyPreviewText,
                        { color: colors.textTertiary },
                        isMe && styles.replyPreviewTextMe,
                      ]}
                      numberOfLines={2}
                    >
                      {truncateText(message.replyTo.text, 60)}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Message text — own messages get inline tag, partner tag is on name row */}
                <View style={isMe && message.tag ? styles.messageRow : undefined}>
                  {isMe && message.tag && (
                    <View
                      style={[
                        styles.tagPill,
                        { backgroundColor: message.tag === 'idea' ? colors.chatTagIdeaBg : colors.chatTagBugBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          { color: message.tag === 'idea' ? colors.chatTagIdeaText : colors.chatTagBugText },
                        ]}
                      >
                        {message.tag === 'idea' ? 'Idea' : 'Bug'}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.messageText, { color: isMe ? colors.chatTextMe : colors.chatTextPartner }]}>
                    {displayText}
                  </Text>
                </View>

                {showTimestamp && (
                  <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
                    {formatTime(message.timestamp)}
                  </Text>
                )}

                {message.resolved && (
                  <View style={styles.resolvedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                    <Text style={styles.resolvedText}>Done</Text>
                  </View>
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
                        { backgroundColor: colors.background, borderColor: colors.border },
                        iReacted && { borderColor: colors.water, backgroundColor: colors.chatReactionActive },
                      ]}
                      onPress={() => onReact(message.id, emoji)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      {count > 1 && (
                        <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>{count}</Text>
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
          <Pressable
            style={[styles.modalMenu, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Quick emoji row */}
            <View style={styles.emojiRow}>
              {QUICK_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiButton, { backgroundColor: colors.background }]}
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
            <View style={[styles.menuActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={styles.menuAction}
                onPress={() => {
                  onReply(message);
                  setShowMenu(false);
                }}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-undo-outline" size={16} color={colors.textPrimary} />
                <Text style={[styles.menuActionText, { color: colors.textPrimary }]}>Reply</Text>
              </TouchableOpacity>

              {isMe && (
                <TouchableOpacity
                  style={styles.menuAction}
                  onPress={() => {
                    onEdit(message);
                    setShowMenu(false);
                  }}
                  activeOpacity={0.6}
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.textPrimary} />
                  <Text style={[styles.menuActionText, { color: colors.textPrimary }]}>Edit</Text>
                </TouchableOpacity>
              )}

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

              {message.tag && (
                <TouchableOpacity
                  style={styles.menuAction}
                  onPress={() => {
                    onResolve(message.id, !message.resolved);
                    setShowMenu(false);
                  }}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name={message.resolved ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                    size={16}
                    color={message.resolved ? colors.textSecondary : '#16A34A'}
                  />
                  <Text
                    style={[
                      styles.menuActionText,
                      { color: message.resolved ? colors.textSecondary : '#16A34A' },
                    ]}
                  >
                    {message.resolved ? 'Reopen' : 'Mark Done'}
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

  // Inline message row (tag + text on same line, for own messages)
  messageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  // Name + tag row for partner messages
  nameTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  senderName: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    marginBottom: 2,
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
  replyPreviewSender: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
  },
  replyPreviewSenderMe: {
    color: 'rgba(255,255,255,0.8)',
  },
  replyPreviewText: {
    ...typography.xs,
    marginTop: 1,
  },
  replyPreviewTextMe: {
    color: 'rgba(255,255,255,0.6)',
  },

  // Tag pill (compact inline badge)
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: fontWeights.semibold,
  },

  // Message text
  messageText: {
    ...typography.sm,
  },
  timestamp: {
    ...typography.xs,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
  },
  timestampMe: {
    color: 'rgba(255,255,255,0.6)',
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  resolvedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  bubbleResolved: {
    opacity: 0.6,
  },

  // Modal context menu
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMenu: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  menuActions: {
    borderTopWidth: 1,
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
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
  },
});
