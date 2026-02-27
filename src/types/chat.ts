import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ChatTag = 'idea' | 'bug';

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  tag: ChatTag | null;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}
