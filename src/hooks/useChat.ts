import { useEffect, useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatTag } from '../types/chat';
import { FeedInteraction } from '../types/habit';
import {
  subscribeToMessages,
  sendMessage as sendChatMessage,
  deleteMessage as deleteChatMessage,
  addChatReaction,
  removeChatReaction,
  subscribeToChatReactions,
  getReactionKey,
} from '../services/chat';
import { useAuthStore } from '../stores/authStore';

const MESSAGE_LIMIT = 50;

export function useChat() {
  const { user, profile, partnerProfile } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Record<string, FeedInteraction>>({});
  const [filter, setFilter] = useState<ChatTag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const reactionsUnsubRef = useRef<(() => void) | null>(null);

  const userId = user?.uid;
  const myName = profile?.displayName || 'Me';
  const partnerName = partnerProfile?.displayName || 'Partner';

  // Subscribe to messages
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = subscribeToMessages(filter, MESSAGE_LIMIT, (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  // Subscribe to reactions for visible messages
  useEffect(() => {
    if (reactionsUnsubRef.current) {
      reactionsUnsubRef.current();
    }

    const messageIds = messages.map((m) => m.id);
    if (messageIds.length === 0) {
      setReactions({});
      return;
    }

    const unsub = subscribeToChatReactions(messageIds, setReactions);
    reactionsUnsubRef.current = unsub;

    return () => {
      if (reactionsUnsubRef.current) {
        reactionsUnsubRef.current();
        reactionsUnsubRef.current = null;
      }
    };
  }, [messages.map((m) => m.id).join(',')]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId || !text.trim()) return;

      const reply = replyTo
        ? {
            id: replyTo.id,
            text: replyTo.text.slice(0, 100),
            userName:
              replyTo.userId === userId ? myName : partnerName,
          }
        : null;

      await sendChatMessage(userId, text.trim(), reply);
      setReplyTo(null);
    },
    [userId, replyTo, myName, partnerName]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      await deleteChatMessage(messageId);
    },
    []
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!userId) return;
      const key = getReactionKey(userId, emoji);
      const existing = reactions[messageId]?.reactions?.[key];
      if (existing) {
        await removeChatReaction(messageId, userId, emoji);
      } else {
        await addChatReaction(messageId, userId, emoji);
      }
    },
    [userId, reactions]
  );

  const clearReplyTo = useCallback(() => {
    setReplyTo(null);
  }, []);

  return {
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
    currentUserId: userId || '',
    myName,
    partnerName,
  };
}
