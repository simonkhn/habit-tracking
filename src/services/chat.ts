import firestore from '@react-native-firebase/firestore';
import { ChatMessage, ChatTag } from '../types/chat';

const chatCollection = () => firestore().collection('chatMessages');

function parseTag(text: string): ChatTag | null {
  if (text.startsWith('#idea ')) return 'idea';
  if (text.startsWith('#bug ')) return 'bug';
  return null;
}

export function subscribeToMessages(
  tag: ChatTag | null,
  messageLimit: number,
  onData: (messages: ChatMessage[]) => void
) {
  let query = chatCollection().orderBy('timestamp', 'desc').limit(messageLimit);

  if (tag) {
    query = chatCollection()
      .where('tag', '==', tag)
      .orderBy('timestamp', 'desc')
      .limit(messageLimit);
  }

  return query.onSnapshot(
    (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      onData(messages);
    },
    (error) => {
      console.error('[chat] subscribeToMessages error:', error);
      onData([]);
    }
  );
}

export async function sendMessage(userId: string, text: string) {
  const tag = parseTag(text);

  await chatCollection().add({
    userId,
    text,
    tag,
    timestamp: firestore.FieldValue.serverTimestamp(),
  });
}
