import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Alert } from 'react-native';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { updateUserProfile, signOut } from '../../src/services/auth';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../src/theme';

export default function SettingsScreen() {
  const { profile, user } = useAuthStore();
  const [saving, setSaving] = useState(false);

  if (!profile || !user) return null;

  const updatePref = async (key: string, value: boolean) => {
    await updateUserProfile(user.uid, {
      notificationPreferences: {
        ...profile.notificationPreferences,
        [key]: value,
      },
    } as any);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const prefs = profile.notificationPreferences;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile */}
      <Text style={styles.sectionTitle}>Profile</Text>
      <Card style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile.displayName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Wake Up Time</Text>
          <Text style={styles.value}>{profile.wakeUpTime}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Water Target</Text>
          <Text style={styles.value}>{profile.waterTargetOz} oz</Text>
        </View>
      </Card>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <Card style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Partner Completions</Text>
          <Switch
            value={prefs.partnerCompletions}
            onValueChange={(v) => updatePref('partnerCompletions', v)}
            trackColor={{ false: colors.border, true: `${colors.success}80` }}
            thumbColor={prefs.partnerCompletions ? colors.success : '#f4f3f4'}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Streak Nudge</Text>
          <Switch
            value={prefs.streakNudge}
            onValueChange={(v) => updatePref('streakNudge', v)}
            trackColor={{ false: colors.border, true: `${colors.success}80` }}
            thumbColor={prefs.streakNudge ? colors.success : '#f4f3f4'}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Morning Reminder</Text>
          <Switch
            value={prefs.morningReminder}
            onValueChange={(v) => updatePref('morningReminder', v)}
            trackColor={{ false: colors.border, true: `${colors.success}80` }}
            thumbColor={prefs.morningReminder ? colors.success : '#f4f3f4'}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Evening Reminder</Text>
          <Switch
            value={prefs.eveningReminder}
            onValueChange={(v) => updatePref('eveningReminder', v)}
            trackColor={{ false: colors.border, true: `${colors.success}80` }}
            thumbColor={prefs.eveningReminder ? colors.success : '#f4f3f4'}
          />
        </View>
      </Card>

      {/* Sign Out */}
      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="secondary"
        style={styles.signOutButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  label: {
    ...typography.base,
    color: colors.textPrimary,
    flex: 1,
  },
  value: {
    ...typography.base,
    color: colors.textSecondary,
  },
  signOutButton: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
  },
});
