import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/hooks/useChat';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatTag } from '../../src/types/chat';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

const FILTERS: { label: string; value: ChatTag | null }[] = [
  { label: 'All', value: null },
  { label: 'Ideas', value: 'idea' },
  { label: 'Bugs', value: 'bug' },
];

export default function ChatScreen() {
  const {
    messages,
    reactions,
    filter,
    setFilter,
    sendMessage,
    deleteMessage,
    toggleReaction,
    replyTo,
    setReplyTo,
    clearReplyTo,
    isLoading,
    currentUserId,
    myName,
    partnerName,
  } = useChat();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  const getSenderName = (userId: string) =>
    userId === currentUserId ? myName : partnerName;

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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <GestureHandlerRootView style={styles.flex}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatBubble
                  message={item}
                  isMe={item.userId === currentUserId}
                  senderName={getSenderName(item.userId)}
                  reactions={reactions[item.id] || null}
                  currentUserId={currentUserId}
                  onReply={setReplyTo}
                  onDelete={deleteMessage}
                  onReact={toggleReaction}
                />
              )}
              inverted
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    {filter
                      ? `No ${filter === 'idea' ? 'ideas' : 'bugs'} yet. Start a message with #${filter} to tag it.`
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

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Message... (#idea or #bug to tag)"
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
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
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
    backgroundColor: colors.textPrimary,
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
    color: colors.textPrimary,
  },
  replyText: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },
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
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
