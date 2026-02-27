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
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/hooks/useChat';
import { useAuthStore } from '../../src/stores/authStore';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatTag } from '../../src/types/chat';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

const FILTERS: { label: string; value: ChatTag | null }[] = [
  { label: 'All', value: null },
  { label: 'Ideas', value: 'idea' },
  { label: 'Bugs', value: 'bug' },
];

export default function ChatScreen() {
  const { messages, filter, setFilter, sendMessage, isLoading, currentUserId } = useChat();
  const { profile, partnerProfile } = useAuthStore();
  const [text, setText] = useState('');

  const myName = profile?.displayName || 'Me';
  const partnerName = partnerProfile?.displayName || 'Partner';

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
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isMe={item.userId === currentUserId}
                senderName={getSenderName(item.userId)}
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
    // inverted FlatList flips this, so it appears centered
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    ...typography.base,
    color: colors.textTertiary,
    textAlign: 'center',
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
