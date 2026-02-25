import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HabitDefinition, JournalHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { Button } from '../ui/Button';
import { isValidJournalEntry } from '../../utils/validation';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface JournalHabitCardProps {
  definition: HabitDefinition;
  data: JournalHabitData;
  onSave: (text: string) => void;
}

export function JournalHabitCard({
  definition,
  data,
  onSave,
}: JournalHabitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState(data.text || '');
  const isValid = isValidJournalEntry(text);

  const handleSave = useCallback(() => {
    if (!isValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(text);
    setExpanded(false);
  }, [text, isValid, onSave]);

  const handleCardPress = useCallback(() => {
    if (data.completed) {
      // Toggle undo: reopen for editing
      setExpanded(true);
    } else {
      setExpanded(!expanded);
    }
  }, [data.completed, expanded]);

  // Collapsed view
  if (!expanded) {
    return (
      <View
        style={[styles.card, data.completed && styles.cardCompleted]}
        onTouchEnd={handleCardPress}
      >
        <View style={styles.row}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${definition.color}1A` },
            ]}
          >
            <HabitIcon
              name={definition.icon}
              size={22}
              color={definition.color}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[styles.label, data.completed && styles.labelCompleted]}
            >
              {definition.label}
            </Text>
            {data.completed && data.text ? (
              <Text style={styles.preview} numberOfLines={1}>
                {data.text}
              </Text>
            ) : (
              <Text style={styles.description}>{definition.description}</Text>
            )}
          </View>
          {data.completed && (
            <View
              style={[
                styles.checkmark,
                { backgroundColor: definition.color },
              ]}
            >
              <HabitIcon name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Expanded view
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${definition.color}1A` },
          ]}
        >
          <HabitIcon
            name={definition.icon}
            size={22}
            color={definition.color}
          />
        </View>
        <Text style={styles.label}>{definition.label}</Text>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="What's on your mind today?"
        placeholderTextColor={colors.textTertiary}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <View style={styles.footer}>
        <Text style={[styles.hint, isValid && styles.hintValid]}>
          {text.trim().length < 10
            ? `${10 - text.trim().length} more characters needed`
            : !(/[.!?]$/.test(text.trim()))
            ? 'End with . ! or ?'
            : 'Ready to save'}
        </Text>
        <Button
          title="Done"
          onPress={handleSave}
          disabled={!isValid}
          variant="primary"
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  description: {
    ...typography.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  preview: {
    ...typography.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  textInput: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    ...typography.base,
    color: colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  hint: {
    ...typography.sm,
    color: colors.textTertiary,
    flex: 1,
  },
  hintValid: {
    color: colors.success,
  },
  saveButton: {
    minWidth: 80,
    height: 40,
  },
});
