import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { UserProfile, NotificationPreferences } from '../types/user';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  partnerCompletions: true,
  streakNudge: true,
  morningReminder: true,
  eveningReminder: true,
  reminderTimes: {
    morning: '08:00',
    evening: '21:00',
  },
};

export async function signIn(email: string, password: string) {
  return auth().signInWithEmailAndPassword(email, password);
}

export async function signUp(
  email: string,
  password: string,
  displayName: 'Simon' | 'Bina'
) {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  const uid = credential.user.uid;

  const profile: UserProfile = {
    uid,
    email,
    displayName,
    partnerId: '',
    wakeUpTime: displayName === 'Simon' ? '09:00' : '07:00',
    waterTargetOz: displayName === 'Simon' ? 80 : 65,
    challengeStartDate: '2026-02-24',
    expoPushToken: null,
    notificationPreferences: DEFAULT_NOTIFICATION_PREFS,
  };

  await firestore().collection('users').doc(uid).set(profile);
  return credential;
}

export async function signOut() {
  return auth().signOut();
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const doc = await firestore().collection('users').doc(uid).get();
  return doc.exists() ? (doc.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
) {
  return firestore().collection('users').doc(uid).update(updates);
}
