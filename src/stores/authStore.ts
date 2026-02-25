import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { UserProfile } from '../types/user';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  profile: UserProfile | null;
  partnerProfile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setPartnerProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  partnerProfile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setPartnerProfile: (partnerProfile) => set({ partnerProfile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      user: null,
      profile: null,
      partnerProfile: null,
      isLoading: false,
    }),
}));
