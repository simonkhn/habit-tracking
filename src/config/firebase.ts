import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase is auto-initialized via google-services.json (Android)
// and GoogleService-Info.plist (iOS) through the native config plugins.
// No manual initialization needed.

export { firebase, auth, firestore };
