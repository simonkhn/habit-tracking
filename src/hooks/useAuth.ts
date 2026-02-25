import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../stores/authStore';
import { UserProfile } from '../types/user';

export function useAuth() {
  const { setUser, setProfile, setPartnerProfile, setIsLoading, user, profile } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setPartnerProfile(null);
        setIsLoading(false);
        return;
      }

      // Listen to user profile
      const profileUnsub = firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .onSnapshot((snapshot) => {
          if (snapshot.exists()) {
            const userProfile = snapshot.data() as UserProfile;
            setProfile(userProfile);

            // If partner is set, listen to partner profile
            if (userProfile.partnerId) {
              firestore()
                .collection('users')
                .doc(userProfile.partnerId)
                .get()
                .then((partnerDoc) => {
                  if (partnerDoc.exists()) {
                    setPartnerProfile(partnerDoc.data() as UserProfile);
                  }
                });
            }
          }
          setIsLoading(false);
        });

      return () => profileUnsub();
    });

    return () => unsubscribe();
  }, []);

  return { user, profile };
}
