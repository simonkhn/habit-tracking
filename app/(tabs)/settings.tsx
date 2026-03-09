import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore, ThemeMode } from '../../src/stores/themeStore';
import { updateUserProfile, signOut } from '../../src/services/auth';
import { useTheme, typography, fontWeights, spacing } from '../../src/theme';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: 'phone-portrait-outline' | 'sunny-outline' | 'moon-outline' }[] = [
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { profile, user } = useAuthStore();
  const { colors } = useTheme();
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

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

  const switchTrack = { false: colors.border, true: `${colors.success}80` };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      {/* Theme */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
      <Card style={styles.section}>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = themeMode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.themeOption,
                  { borderColor: active ? colors.accent : colors.border },
                  active && { backgroundColor: `${colors.accent}12` },
                ]}
                onPress={() => setThemeMode(opt.mode)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={active ? colors.accent : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    { color: active ? colors.accent : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Profile */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile</Text>
      <Card style={styles.section}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Name</Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>{profile.displayName}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>{profile.email}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Wake Up Time</Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>{profile.wakeUpTime}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Water Target</Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>{profile.waterTargetOz} oz</Text>
        </View>
      </Card>

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
      <Card style={styles.section}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Partner Completions</Text>
          <Switch
            value={prefs.partnerCompletions}
            onValueChange={(v) => updatePref('partnerCompletions', v)}
            trackColor={switchTrack}
            thumbColor={prefs.partnerCompletions ? colors.success : colors.switchThumbOff}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Streak Nudge</Text>
          <Switch
            value={prefs.streakNudge}
            onValueChange={(v) => updatePref('streakNudge', v)}
            trackColor={switchTrack}
            thumbColor={prefs.streakNudge ? colors.success : colors.switchThumbOff}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Morning Reminder</Text>
          <Switch
            value={prefs.morningReminder}
            onValueChange={(v) => updatePref('morningReminder', v)}
            trackColor={switchTrack}
            thumbColor={prefs.morningReminder ? colors.success : colors.switchThumbOff}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Evening Reminder</Text>
          <Switch
            value={prefs.eveningReminder}
            onValueChange={(v) => updatePref('eveningReminder', v)}
            trackColor={switchTrack}
            thumbColor={prefs.eveningReminder ? colors.success : colors.switchThumbOff}
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
  },
  sectionTitle: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    padding: 0,
  },
  themeRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 4,
  },
  themeLabel: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
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
    marginHorizontal: spacing.lg,
  },
  label: {
    ...typography.base,
    flex: 1,
  },
  value: {
    ...typography.base,
  },
  signOutButton: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
  },
});
