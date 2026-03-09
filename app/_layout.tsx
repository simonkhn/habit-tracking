import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ThemeProvider as NavThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuth } from '../src/hooks/useAuth';
import { useNotifications } from '../src/hooks/useNotifications';
import { useAuthStore } from '../src/stores/authStore';
import { useThemeStore } from '../src/stores/themeStore';
import { ThemeProvider, useTheme } from '../src/theme';

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading } = useAuthStore();
  const { colors } = useTheme();

  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return <Slot />;
}

function AppContent() {
  const { colors, isDark } = useTheme();

  useAuth();
  useNotifications();

  const navTheme = React.useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme : DefaultTheme).colors,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        primary: colors.accent,
        notification: colors.error,
      },
    }),
    [colors, isDark]
  );

  return (
    <NavThemeProvider value={navTheme}>
      <KeyboardProvider>
        <GestureHandlerRootView style={styles.container}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AuthGate />
        </GestureHandlerRootView>
      </KeyboardProvider>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const isHydrated = useThemeStore((s) => s.isHydrated);

  if (!isHydrated) return null;

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
