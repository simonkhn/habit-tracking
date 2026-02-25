import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HabitDefinition, WorkoutHabitData } from '../../types/habit';
import { HabitIcon } from './HabitIcon';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface WorkoutHabitCardProps {
  definition: HabitDefinition;
  data: WorkoutHabitData;
  onToggle: () => void;
  onSaveNote: (note: string) => void;
}

const HOLD_DURATION = 500;

export function WorkoutHabitCard({ definition, data, onToggle, onSaveNote }: WorkoutHabitCardProps) {
  const completed = data?.completed ?? false;
  const fillProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const isHolding = useRef(false);
  const justCompleted = useRef(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  const triggerComplete = useCallback(() => {
    justCompleted.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fillProgress.value = withTiming(0, { duration: 200 });
    cardScale.value = withSpring(1);
    setShowNoteModal(true);
  }, []);

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

  const handlePressIn = useCallback(() => {
    if (completed) return;
    isHolding.current = true;
    cardScale.value = withTiming(0.97, { duration: 100 });
    fillProgress.value = withTiming(1, { duration: HOLD_DURATION });

    holdTimer.current = setTimeout(() => {
      if (isHolding.current) {
        runOnJS(triggerComplete)();
      }
    }, HOLD_DURATION);
  }, [completed, triggerComplete]);

  const handlePressOut = useCallback(() => {
    isHolding.current = false;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (!completed) {
      fillProgress.value = withTiming(0, { duration: 150 });
    }
    cardScale.value = withSpring(1);
  }, [completed]);

  const handleTap = useCallback(() => {
    if (justCompleted.current) {
      justCompleted.current = false;
      return;
    }
    if (completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle();
    }
  }, [completed, onToggle]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
    backgroundColor: `${definition.color}26`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleTap}
      >
        <Animated.View
          style={[
            styles.card,
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
                  completed && styles.labelCompleted,
                ]}
              >
                {definition.label}
              </Text>
              <Text style={styles.description}>{definition.description}</Text>
            </View>
            {completed && (
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
          {completed && data?.note ? (
            <View style={styles.notePreview}>
              <Text style={styles.notePreviewText} numberOfLines={1}>
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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>What did you do?</Text>
            <TextInput
              style={styles.modalInput}
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
              <Pressable style={styles.skipButton} onPress={handleSkipNote}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </Pressable>
              <Pressable
                style={[styles.doneButton, { backgroundColor: definition.color }]}
                onPress={handleSubmitNote}
              >
                <Text style={styles.doneButtonText}>Done</Text>
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalInput: {
    ...typography.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
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
    color: '#FFFFFF',
  },
});
