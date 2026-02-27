import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types/chat';
import { colors, typography, fontWeights, spacing, borderRadius } from '../../theme';

interface ChatBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  senderName: string;
}

function getDisplayText(text: string): string {
  if (text.startsWith('#idea ')) return text.slice(6);
  if (text.startsWith('#bug ')) return text.slice(5);
  return text;
}

function formatTime(timestamp: ChatMessage['timestamp']): string {
  if (!timestamp?.toDate) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function ChatBubble({ message, isMe, senderName }: ChatBubbleProps) {
  const displayText = getDisplayText(message.text);

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowPartner]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubblePartner]}>
        {!isMe && <Text style={styles.senderName}>{senderName}</Text>}

        {message.tag && (
          <View
            style={[
              styles.tagPill,
              message.tag === 'idea' ? styles.tagIdea : styles.tagBug,
            ]}
          >
            <Ionicons
              name={message.tag === 'idea' ? 'bulb-outline' : 'bug-outline'}
              size={12}
              color={message.tag === 'idea' ? '#2563EB' : '#DC2626'}
            />
            <Text
              style={[
                styles.tagText,
                message.tag === 'idea' ? styles.tagTextIdea : styles.tagTextBug,
              ]}
            >
              {message.tag === 'idea' ? 'Idea' : 'Bug'}
            </Text>
          </View>
        )}

        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
          {displayText}
        </Text>

        <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  rowMe: {
    alignItems: 'flex-end',
  },
  rowPartner: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  bubbleMe: {
    backgroundColor: colors.textPrimary,
    borderBottomRightRadius: 4,
  },
  bubblePartner: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderName: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  tagIdea: {
    backgroundColor: '#DBEAFE',
  },
  tagBug: {
    backgroundColor: '#FEE2E2',
  },
  tagText: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
  },
  tagTextIdea: {
    color: '#2563EB',
  },
  tagTextBug: {
    color: '#DC2626',
  },
  messageText: {
    ...typography.sm,
    color: colors.textPrimary,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  timestamp: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: 4,
  },
  timestampMe: {
    color: 'rgba(255,255,255,0.6)',
  },
});
