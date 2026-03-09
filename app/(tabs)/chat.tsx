import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/hooks/useChat';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatMessage, ChatFilter } from '../../src/types/chat';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

const ACCENT_BLUE = '#3B82F6';
const TWO_MINUTES = 2 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

const FILTERS: { label: string; value: ChatFilter | null }[] = [
  { label: 'All', value: null },
  { label: 'Ideas', value: 'idea' },
  { label: 'Bugs', value: 'bug' },
  { label: 'Done', value: 'done' },
];

// --- List item types ---

type ChatListItem =
  | {
      type: 'message';
      data: ChatMessage;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
      showTimestamp: boolean;
    }
  | { type: 'dateSeparator'; date: string };

// --- Helpers ---

function getMessageTime(msg: ChatMessage): number {
  return msg.timestamp?.toDate?.() ? msg.timestamp.toDate().getTime() : 0;
}

function formatDateSeparator(dateStr: string): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (dateStr === toDateKey(today)) return 'Today';
  if (dateStr === toDateKey(yesterday)) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getDateKey(msg: ChatMessage): string {
  const d = msg.timestamp?.toDate?.();
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Build the list items with grouping info and date separators.
 *
 * `messages` is sorted newest-first (index 0 = newest, displayed at bottom due to inverted FlatList).
 *
 * In display order (bottom to top):
 *   messages[0] is at the bottom, messages[N-1] is at the top.
 *
 * For message at index i:
 *   - Display-above (older) = messages[i+1]
 *   - Display-below (newer) = messages[i-1]
 */
function buildListItems(messages: ChatMessage[]): ChatListItem[] {
  if (messages.length === 0) return [];

  const items: ChatListItem[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const msgTime = getMessageTime(msg);

    // Message above in display (older) = messages[i+1]
    const olderMsg = i + 1 < messages.length ? messages[i + 1] : null;
    // Message below in display (newer) = messages[i-1]
    const newerMsg = i - 1 >= 0 ? messages[i - 1] : null;

    const olderTime = olderMsg ? getMessageTime(olderMsg) : 0;
    const newerTime = newerMsg ? getMessageTime(newerMsg) : 0;

    const isFirstInGroup =
      !olderMsg ||
      olderMsg.userId !== msg.userId ||
      Math.abs(msgTime - olderTime) > TWO_MINUTES;

    const isLastInGroup =
      !newerMsg ||
      newerMsg.userId !== msg.userId ||
      Math.abs(newerTime - msgTime) > TWO_MINUTES;

    const showTimestamp =
      isLastInGroup || !newerMsg || Math.abs(newerTime - msgTime) > FIVE_MINUTES;

    items.push({
      type: 'message',
      data: msg,
      isFirstInGroup,
      isLastInGroup,
      showTimestamp,
    });

    // Insert date separator AFTER this message in the array (which means ABOVE it visually
    // since FlatList is inverted) when this message and the older message are on different days,
    // or when this is the oldest message.
    const currentDateKey = getDateKey(msg);
    const olderDateKey = olderMsg ? getDateKey(olderMsg) : null;

    if (currentDateKey && (!olderMsg || currentDateKey !== olderDateKey)) {
      items.push({ type: 'dateSeparator', date: currentDateKey });
    }
  }

  return items;
}

export default function ChatScreen() {
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    reactions,
    filter,
    setFilter,
    sendMessage,
    editMessage,
    deleteMessage,
    resolveMessage,
    toggleReaction,
    replyTo,
    setReplyTo,
    clearReplyTo,
    editingMessage,
    setEditingMessage,
    clearEditing,
    isLoading,
    currentUserId,
    myName,
    partnerName,
  } = useChat();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    if (editingMessage) {
      editMessage(editingMessage.id, text);
    } else {
      sendMessage(text);
    }
    setText('');
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessage(message);
    setText(message.text);
  };

  const getSenderName = (userId: string) =>
    userId === currentUserId ? myName : partnerName;

  // Build grouped list items with date separators
  const listItems = useMemo(() => buildListItems(messages), [messages]);

  const scrollToMessage = useCallback((messageId: string) => {
    const index = listItems.findIndex(
      (item) => item.type === 'message' && item.data.id === messageId
    );
    if (index >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  }, [listItems]);

  const getItemKey = (item: ChatListItem) =>
    item.type === 'message' ? item.data.id : `sep-${item.date}`;

  const renderItem = ({ item }: { item: ChatListItem }) => {
    if (item.type === 'dateSeparator') {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateSeparatorLine} />
          <Text style={styles.dateSeparatorText}>
            {formatDateSeparator(item.date)}
          </Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      );
    }

    return (
      <ChatBubble
        message={item.data}
        isMe={item.data.userId === currentUserId}
        senderName={getSenderName(item.data.userId)}
        reactions={reactions[item.data.id] || null}
        currentUserId={currentUserId}
        onReply={setReplyTo}
        onEdit={handleStartEdit}
        onDelete={deleteMessage}
        onResolve={resolveMessage}
        onReact={toggleReaction}
        onScrollToMessage={scrollToMessage}
        isFirstInGroup={item.isFirstInGroup}
        isLastInGroup={item.isLastInGroup}
        showTimestamp={item.showTimestamp}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.screenTitle}>Chat</Text>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <TouchableOpacity
              key={f.label}
              style={[styles.filterPill, active && styles.filterPillActive]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
        >
          <GestureHandlerRootView style={styles.flex}>
            <FlatList
              ref={flatListRef}
              data={listItems}
              keyExtractor={getItemKey}
              renderItem={renderItem}
              inverted
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={(info) => {
                flatListRef.current?.scrollToOffset({
                  offset: info.averageItemLength * info.index,
                  animated: true,
                });
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    {filter === 'done'
                      ? 'No completed items yet.'
                      : filter
                        ? `No open ${filter === 'idea' ? 'ideas' : 'bugs'} yet. Use #${filter} anywhere in a message to tag it.`
                        : 'No messages yet. Say something!'}
                  </Text>
                </View>
              }
            />
          </GestureHandlerRootView>

          {/* Reply preview bar */}
          {replyTo && (
            <View style={styles.replyBar}>
              <View style={styles.replyAccent} />
              <View style={styles.replyContent}>
                <Text style={styles.replyLabel}>
                  Replying to {getSenderName(replyTo.userId)}
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {replyTo.text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={clearReplyTo}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
              >
                <Ionicons name="close" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Edit preview bar */}
          {editingMessage && (
            <View style={styles.replyBar}>
              <View style={[styles.replyAccent, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.replyContent}>
                <Text style={[styles.replyLabel, { color: '#F59E0B' }]}>
                  Editing message
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {editingMessage.text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  clearEditing();
                  setText('');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
              >
                <Ionicons name="close" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Message... (use #idea or #bug to tag)"
              placeholderTextColor={colors.textTertiary}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!text.trim()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={20}
                color={text.trim() ? '#FFFFFF' : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  screenTitle: {
    ...typography.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: ACCENT_BLUE,
    borderColor: ACCENT_BLUE,
  },
  filterText: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    ...typography.base,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // Date separators
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: spacing.md,
  },
  dateSeparatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dateSeparatorText: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
  },

  // Reply bar
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: ACCENT_BLUE,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  replyContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  replyLabel: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: ACCENT_BLUE,
  },
  replyText: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    ...typography.sm,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
