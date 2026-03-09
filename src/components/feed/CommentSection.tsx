import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedComment } from '../../types/habit';
import { useTheme, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface CommentSectionProps {
  comments: FeedComment[];
  currentUserId: string;
  userName: string;
  partnerName: string;
  onSubmit: (text: string) => void;
}

export function CommentSection({
  comments,
  currentUserId,
  userName,
  partnerName,
  onSubmit,
}: CommentSectionProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  const getDisplayName = (userId: string) =>
    userId === currentUserId ? userName : partnerName;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chatbubble-outline"
          size={14}
          color={colors.textTertiary}
        />
        <Text style={[styles.toggleText, { color: colors.textTertiary }]}>
          {comments.length > 0
            ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
            : 'Add a comment'}
        </Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expanded}>
          {comments.map((comment, i) => (
            <View key={i} style={[styles.comment, { borderLeftColor: colors.border }]}>
              <Text style={[styles.commentAuthor, { color: colors.textSecondary }]}>
                {getDisplayName(comment.userId)}
              </Text>
              <Text style={[styles.commentText, { color: colors.textPrimary }]}>{comment.text}</Text>
            </View>
          ))}

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.background }]}
              placeholder="Say something nice..."
              placeholderTextColor={colors.textTertiary}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.background }, !text.trim() && styles.sendButtonDisabled]}
              onPress={handleSubmit}
              disabled={!text.trim()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={16}
                color={text.trim() ? colors.textPrimary : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  toggleText: {
    ...typography.xs,
    flex: 1,
  },
  expanded: {
    marginTop: spacing.sm,
  },
  comment: {
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
  },
  commentAuthor: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
  },
  commentText: {
    ...typography.sm,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.sm,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
