import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../stores/authStore';
import { UserProfile } from '../types/user';

export function useAuth() {
  const { setUser, setProfile, setPartnerProfile, setIsLoading, user, profile } =
    useAuthStore();

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;
    let partnerUnsub: (() => void) | null = null;

    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);

      // Clean up previous listeners
      if (profileUnsub) profileUnsub();
      if (partnerUnsub) partnerUnsub();
      profileUnsub = null;
      partnerUnsub = null;

      if (!firebaseUser) {
        setProfile(null);
        setPartnerProfile(null);
        setIsLoading(false);
        return;
      }

      let currentPartnerId: string | null = null;

      profileUnsub = firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .onSnapshot((snapshot) => {
          if (snapshot.exists()) {
            const userProfile = snapshot.data() as UserProfile;
            setProfile(userProfile);

            // Subscribe to partner profile (real-time)
            if (userProfile.partnerId && userProfile.partnerId !== currentPartnerId) {
              currentPartnerId = userProfile.partnerId;
              if (partnerUnsub) partnerUnsub();
              partnerUnsub = firestore()
                .collection('users')
                .doc(userProfile.partnerId)
                .onSnapshot((partnerDoc) => {
                  if (partnerDoc.exists()) {
                    setPartnerProfile(partnerDoc.data() as UserProfile);
                  }
                });
            } else if (!userProfile.partnerId) {
              currentPartnerId = null;
              if (partnerUnsub) partnerUnsub();
              partnerUnsub = null;
              setPartnerProfile(null);
            }
          }
          setIsLoading(false);
        });
    });

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
      if (partnerUnsub) partnerUnsub();
    };
  }, []);

  return { user, profile };
}
