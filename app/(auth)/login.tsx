import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn } from '../../src/services/auth';
import { Button } from '../../src/components/ui/Button';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password);
      // Auth state change will trigger navigation
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>75-Day Challenge</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome back</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Email"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Password"
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Create Account"
          onPress={() => router.push('/(auth)/signup')}
          variant="ghost"
          style={styles.linkButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    ...typography.xxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  input: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    padding: spacing.lg,
    ...typography.base,
    marginBottom: spacing.md,
  },
  error: {
    ...typography.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  linkButton: {
    marginTop: spacing.md,
  },
});
