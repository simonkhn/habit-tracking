import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ChatTag = 'idea' | 'bug';

export interface ChatReplyTo {
  id: string;
  text: string;
  userName: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  tag: ChatTag | null;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  replyTo: ChatReplyTo | null;
  imageUrl: string | null;
}
