import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { HabitDefinition, WorkoutHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';
import { useHoldToComplete } from '../../hooks/useHoldToComplete';

interface WorkoutHabitCardProps {
  definition: HabitDefinition;
  data: WorkoutHabitData;
  onToggle: () => void;
  onSaveNote: (note: string) => void;
}

export function WorkoutHabitCard({ definition, data, onToggle, onSaveNote }: WorkoutHabitCardProps) {
  const { colors } = useTheme();
  const completed = data?.completed ?? false;
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  const { fillStyle, cardAnimStyle, pressHandlers } = useHoldToComplete({
    completed,
    onComplete: () => setShowNoteModal(true),
    onUndo: onToggle,
    color: definition.color,
  });

  const handleSubmitNote = useCallback(() => {
    if (noteText.trim()) {
      onSaveNote(noteText.trim());
    }
    onToggle();
    setShowNoteModal(false);
    setNoteText('');
  }, [noteText, onSaveNote, onToggle]);

  const handleSkipNote = useCallback(() => {
    onToggle();
    setShowNoteModal(false);
    setNoteText('');
  }, [onToggle]);

  return (
    <>
      <Pressable {...pressHandlers}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
            completed && styles.cardCompleted,
            cardAnimStyle,
          ]}
        >
          <Animated.View style={[styles.fillOverlay, fillStyle]} />
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
                style={[
                  styles.label,
                  { color: colors.textPrimary },
                  completed && [styles.labelCompleted, { color: colors.textTertiary }],
                ]}
              >
                {definition.label}
              </Text>
              <Text style={[styles.description, { color: colors.textTertiary }]}>{definition.description}</Text>
            </View>
            {completed && (
              <View
                style={[
                  styles.checkmark,
                  { backgroundColor: definition.color },
                ]}
              >
                <HabitIcon name="checkmark" size={16} color={colors.textOnPrimary} />
              </View>
            )}
          </View>
          {completed && data?.note ? (
            <View style={styles.notePreview}>
              <Text style={[styles.notePreviewText, { color: colors.textSecondary }]} numberOfLines={1}>
                {data.note}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </Pressable>

      <Modal
        visible={showNoteModal}
        transparent
        animationType="slide"
        onRequestClose={handleSkipNote}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleSkipNote} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>What did you do?</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border }]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Ran 3 miles..."
              placeholderTextColor={colors.textTertiary}
              maxLength={120}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmitNote}
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.skipButton, { backgroundColor: colors.background }]} onPress={handleSkipNote}>
                <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip</Text>
              </Pressable>
              <Pressable
                style={[styles.doneButton, { backgroundColor: definition.color }]}
                onPress={handleSubmitNote}
              >
                <Text style={[styles.doneButtonText, { color: colors.textOnPrimary }]}>Done</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCompleted: {
    opacity: 0.7,
  },
  fillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: borderRadius.md,
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
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    ...typography.sm,
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
  notePreview: {
    marginTop: spacing.sm,
    marginLeft: 40 + spacing.md,
  },
  notePreviewText: {
    ...typography.sm,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  modalTitle: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.md,
  },
  modalInput: {
    ...typography.base,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.base,
    fontWeight: fontWeights.medium,
  },
  doneButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  doneButtonText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
  },
});
