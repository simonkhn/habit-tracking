import firestore from '@react-native-firebase/firestore';
import { ChatMessage, ChatTag, ChatReplyTo, ChatFilter } from '../types/chat';
import { FeedInteraction } from '../types/habit';

const chatCollection = () => firestore().collection('chatMessages');
const chatReactionsCollection = () => firestore().collection('chatReactions');

function parseTag(text: string): ChatTag | null {
  if (/#idea\b/i.test(text)) return 'idea';
  if (/#bug\b/i.test(text)) return 'bug';
  return null;
}

export function subscribeToMessages(
  filter: ChatFilter | null,
  messageLimit: number,
  onData: (messages: ChatMessage[]) => void
) {
  let query = chatCollection().orderBy('timestamp', 'desc').limit(messageLimit);

  if (filter === 'done') {
    query = chatCollection()
      .where('resolved', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(messageLimit);
  } else if (filter) {
    query = chatCollection()
      .where('tag', '==', filter)
      .orderBy('timestamp', 'desc')
      .limit(messageLimit);
  }

  return query.onSnapshot(
    (snapshot) => {
      let messages: ChatMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      // For idea/bug filters, hide resolved items
      if (filter === 'idea' || filter === 'bug') {
        messages = messages.filter((m) => !m.resolved);
      }

      onData(messages);
    },
    (error) => {
      console.error('[chat] subscribeToMessages error:', error);
      onData([]);
    }
  );
}

export async function sendMessage(
  userId: string,
  text: string,
  replyTo?: ChatReplyTo | null
) {
  const tag = parseTag(text);

  await chatCollection().add({
    userId,
    text,
    tag,
    resolved: false,
    timestamp: firestore.FieldValue.serverTimestamp(),
    replyTo: replyTo || null,
    imageUrl: null,
  });
}

export async function editMessage(messageId: string, newText: string) {
  const tag = parseTag(newText);
  await chatCollection().doc(messageId).update({
    text: newText,
    tag,
  });
}

export async function resolveMessage(messageId: string, resolved: boolean) {
  await chatCollection().doc(messageId).update({ resolved });
}

export async function deleteMessage(messageId: string) {
  await chatCollection().doc(messageId).delete();
  // Also clean up reactions for this message
  const reactionsDoc = await chatReactionsCollection().doc(messageId).get();
  if (reactionsDoc.exists()) {
    await chatReactionsCollection().doc(messageId).delete();
  }
}

// --- Chat reactions (same pattern as feed reactions in firestore.ts) ---

export function getReactionKey(userId: string, emoji: string): string {
  return `${userId}_${emoji}`;
}

export async function addChatReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const ref = chatReactionsCollection().doc(messageId);
  const key = getReactionKey(userId, emoji);
  return ref.set(
    {
      reactions: {
        [key]: {
          userId,
          emoji,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
      },
    },
    { merge: true }
  );
}

export async function removeChatReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const ref = chatReactionsCollection().doc(messageId);
  const key = getReactionKey(userId, emoji);
  return ref.update({
    [`reactions.${key}`]: firestore.FieldValue.delete(),
  });
}

export function subscribeToChatReactions(
  messageIds: string[],
  onData: (reactions: Record<string, FeedInteraction>) => void
) {
  if (messageIds.length === 0) {
    onData({});
    return () => {};
  }

  const reactions: Record<string, FeedInteraction> = {};
  const unsubscribes: (() => void)[] = [];

  for (const messageId of messageIds) {
    const unsub = chatReactionsCollection()
      .doc(messageId)
      .onSnapshot(
        (snapshot) => {
          if (snapshot && snapshot.exists()) {
            reactions[messageId] = snapshot.data() as FeedInteraction;
          } else {
            delete reactions[messageId];
          }
          onData({ ...reactions });
        },
        (_error) => {
          delete reactions[messageId];
          onData({ ...reactions });
        }
      );
    unsubscribes.push(unsub);
  }

  return () => unsubscribes.forEach((u) => u());
}
