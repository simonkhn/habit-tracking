import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { signUp } from '../../src/services/auth';
import { Button } from '../../src/components/ui/Button';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState<'Simon' | 'Bina' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(email.trim(), password, name);
    } catch (e: any) {
      setError(e.message || 'Signup failed');
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Join the Challenge</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create your account</Text>

        <View style={styles.nameButtons}>
          <Button
            title="Simon"
            onPress={() => setName('Simon')}
            variant={name === 'Simon' ? 'primary' : 'secondary'}
            style={styles.nameButton}
          />
          <Button
            title="Bina"
            onPress={() => setName('Bina')}
            variant={name === 'Bina' ? 'primary' : 'secondary'}
            style={styles.nameButton}
          />
        </View>

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
          title="Create Account"
          onPress={handleSignup}
          loading={loading}
          disabled={!name}
          style={styles.button}
        />

        <Button
          title="Already have an account? Sign In"
          onPress={() => router.back()}
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
  nameButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  nameButton: {
    flex: 1,
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
