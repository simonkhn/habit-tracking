import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeed, FeedDay } from '../../src/hooks/useFeed';
import { DualProgressHeader } from '../../src/components/feed/DualProgressHeader';
import { DayHeader } from '../../src/components/feed/DayHeader';
import { FeedCard } from '../../src/components/feed/FeedCard';
import { FeedEvent } from '../../src/types/habit';
import { colors, typography, fontWeights, spacing } from '../../src/theme';

type FeedListItem =
  | { type: 'header' }
  | { type: 'dayHeader'; label: string; date: string }
  | { type: 'event'; event: FeedEvent };

export default function FeedScreen() {
  const {
    feedDays,
    isLoading,
    myName,
    partnerName,
    myTodayLog,
    partnerTodayLog,
    myCompletedCount,
    partnerCompletedCount,
    totalHabits,
    toggleReaction,
    postComment,
    currentUserId,
  } = useFeed();

  // Flatten feedDays into a list of items for FlatList
  const listData: FeedListItem[] = React.useMemo(() => {
    const items: FeedListItem[] = [{ type: 'header' }];

    for (const day of feedDays) {
      items.push({ type: 'dayHeader', label: day.label, date: day.date });
      for (const event of day.events) {
        items.push({ type: 'event', event });
      }
    }

    return items;
  }, [feedDays]);

  const getItemKey = (item: FeedListItem, index: number) => {
    if (item.type === 'header') return 'header';
    if (item.type === 'dayHeader') return `day-${item.date}`;
    return item.event.id;
  };

  const renderItem = ({ item }: { item: FeedListItem }) => {
    if (item.type === 'header') {
      return (
        <DualProgressHeader
          myName={myName}
          partnerName={partnerName}
          myHabits={myTodayLog?.habits || null}
          partnerHabits={partnerTodayLog?.habits || null}
          myCompletedCount={myCompletedCount}
          partnerCompletedCount={partnerCompletedCount}
          totalHabits={totalHabits}
        />
      );
    }

    if (item.type === 'dayHeader') {
      return <DayHeader label={item.label} />;
    }

    return (
      <FeedCard
        event={item.event}
        currentUserId={currentUserId}
        userName={myName}
        partnerName={partnerName}
        onReact={toggleReaction}
        onComment={postComment}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Feed</Text>
      <FlatList
        data={listData}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No activity yet today. Start completing habits!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenTitle: {
    ...typography.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.base,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
