import { useEffect, useState, useCallback } from 'react';
import { ChatMessage, ChatTag } from '../types/chat';
import { subscribeToMessages, sendMessage as sendChatMessage } from '../services/chat';
import { useAuthStore } from '../stores/authStore';

const MESSAGE_LIMIT = 50;

export function useChat() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<ChatTag | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.uid;

  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = subscribeToMessages(filter, MESSAGE_LIMIT, (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId || !text.trim()) return;
      await sendChatMessage(userId, text.trim());
    },
    [userId]
  );

  return {
    messages,
    filter,
    setFilter,
    sendMessage,
    isLoading,
    currentUserId: userId || '',
  };
}
