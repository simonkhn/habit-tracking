import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  isHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setHydrated: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      isHydrated: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);
