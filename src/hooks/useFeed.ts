import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { HabitLog, HabitId, FeedEvent, FeedInteraction, WaterHabitData, ReadingHabitData, WorkoutHabitData } from '../types/habit';
import { HABIT_DEFINITIONS, HABIT_ORDER } from '../config/habits';
import { subscribeToDayLog, subscribeToFeedInteractions, getFeedEventId, addReaction, removeReaction, addComment, getReactionKey } from '../services/firestore';
import { getHabitDate } from '../utils/dates';
import { useAuthStore } from '../stores/authStore';
import { format, subDays, parseISO } from 'date-fns';

const FEED_DAYS = 3; // Show today + 2 previous days

function getFlavorText(
  userName: string,
  habitId: HabitId,
  habitData: any,
): string {
  switch (habitId) {
    case 'wakeUpOnTime':
      return `${userName} woke up on time`;
    case 'morningSunlight':
      return `${userName} got morning sunlight`;
    case 'water': {
      const water = habitData as WaterHabitData;
      return `${userName} hit ${water.currentOz}oz of water`;
    }
    case 'journal':
      return `${userName} journaled today`;
    case 'reading': {
      const reading = habitData as ReadingHabitData;
      return `${userName} read ${reading.pagesRead} pages`;
    }
    case 'workout': {
      const workout = habitData as WorkoutHabitData;
      if (workout.note) {
        return `${userName} crushed ${workout.note}`;
      }
      return `${userName} completed a workout`;
    }
    case 'meditate':
      return `${userName} meditated`;
    default:
      return `${userName} completed ${habitId}`;
  }
}

function buildEventsFromLog(log: HabitLog, userName: string): FeedEvent[] {
  const events: FeedEvent[] = [];
  let completedCount = 0;

  for (const habitId of HABIT_ORDER) {
    const habitData = log.habits[habitId];
    if (!habitData?.completed || !habitData.completedAt) continue;

    completedCount++;
    const def = HABIT_DEFINITIONS.find((d) => d.id === habitId)!;
    const completedAt = habitData.completedAt.toDate();

    events.push({
      id: getFeedEventId(log.userId, log.date, habitId),
      userId: log.userId,
      userName,
      date: log.date,
      habitId,
      habitLabel: def.label,
      habitColor: def.color,
      habitIcon: def.icon,
      habitType: def.type,
      completedAt,
      flavorText: getFlavorText(userName, habitId, habitData),
      interaction: null,
    });
  }

  // Add "all complete" event if all habits are done
  if (completedCount === HABIT_ORDER.length) {
    // Use the latest completedAt from all habits
    const latestTime = events.reduce((latest, e) =>
      e.completedAt > latest ? e.completedAt : latest,
      events[0].completedAt,
    );

    events.push({
      id: getFeedEventId(log.userId, log.date, 'allComplete'),
      userId: log.userId,
      userName,
      date: log.date,
      habitId: 'allComplete',
      habitLabel: 'All Habits Complete!',
      habitColor: '#FFD700',
      habitIcon: 'trophy-outline',
      habitType: 'allComplete',
      completedAt: latestTime,
      flavorText: `${userName} completed all ${HABIT_ORDER.length} habits!`,
      interaction: null,
    });
  }

  return events;
}

export interface FeedDay {
  date: string;
  label: string; // "Today, Day X" or "Yesterday" or formatted date
  events: FeedEvent[];
}

export function useFeed() {
  const { user, profile, partnerProfile } = useAuthStore();
  const [myLogs, setMyLogs] = useState<Record<string, HabitLog | null>>({});
  const [partnerLogs, setPartnerLogs] = useState<Record<string, HabitLog | null>>({});
  const [interactions, setInteractions] = useState<Record<string, FeedInteraction>>({});
  const [isLoading, setIsLoading] = useState(true);
  const interactionUnsubRef = useRef<(() => void) | null>(null);

  const userId = user?.uid;
  const partnerId = profile?.partnerId;
  const myName = profile?.displayName || 'Me';
  const partnerName = partnerProfile?.displayName || 'Partner';
  const challengeStartDate = profile?.challengeStartDate;
  const wakeUpTime = profile?.wakeUpTime ?? '06:00';

  // Get date strings for the feed window
  const dates = useMemo(() => {
    const today = getHabitDate(wakeUpTime);
    return Array.from({ length: FEED_DAYS }, (_, i) =>
      format(subDays(today, i), 'yyyy-MM-dd'),
    );
  }, [wakeUpTime]);

  // Subscribe to both users' habit logs for the feed window
  useEffect(() => {
    if (!userId || !partnerId) {
      setIsLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];
    let loadedCount = 0;
    const totalExpected = dates.length * 2;

    for (const date of dates) {
      // My logs
      const myUnsub = subscribeToDayLog(userId, date, (log) => {
        setMyLogs((prev) => ({ ...prev, [date]: log }));
        loadedCount++;
        if (loadedCount >= totalExpected) setIsLoading(false);
      });
      unsubscribes.push(myUnsub);

      // Partner logs
      const partnerUnsub = subscribeToDayLog(partnerId, date, (log) => {
        setPartnerLogs((prev) => ({ ...prev, [date]: log }));
        loadedCount++;
        if (loadedCount >= totalExpected) setIsLoading(false);
      });
      unsubscribes.push(partnerUnsub);
    }

    return () => unsubscribes.forEach((u) => u());
  }, [userId, partnerId, dates]);

  // Build all events from logs
  const allEvents = useMemo(() => {
    const events: FeedEvent[] = [];

    for (const date of dates) {
      const myLog = myLogs[date];
      const partnerLog = partnerLogs[date];

      if (myLog) {
        events.push(...buildEventsFromLog(myLog, myName));
      }
      if (partnerLog) {
        events.push(...buildEventsFromLog(partnerLog, partnerName));
      }
    }

    return events;
  }, [myLogs, partnerLogs, dates, myName, partnerName]);

  // Subscribe to feed interactions for all current events
  useEffect(() => {
    if (interactionUnsubRef.current) {
      interactionUnsubRef.current();
    }

    const eventIds = allEvents.map((e) => e.id);
    if (eventIds.length === 0) {
      setInteractions({});
      return;
    }

    const unsub = subscribeToFeedInteractions(eventIds, setInteractions);
    interactionUnsubRef.current = unsub;

    return () => {
      if (interactionUnsubRef.current) {
        interactionUnsubRef.current();
        interactionUnsubRef.current = null;
      }
    };
  }, [allEvents.map((e) => e.id).join(',')]);

  // Merge interactions into events and group by day
  const feedDays: FeedDay[] = useMemo(() => {
    const habitDate = getHabitDate(wakeUpTime);
    const today = format(habitDate, 'yyyy-MM-dd');
    const yesterday = format(subDays(habitDate, 1), 'yyyy-MM-dd');

    // Merge interactions
    const eventsWithInteractions = allEvents.map((event) => ({
      ...event,
      interaction: interactions[event.id] || null,
    }));

    // Sort by completedAt descending
    eventsWithInteractions.sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
    );

    // Group by date
    const dayMap = new Map<string, FeedEvent[]>();
    for (const event of eventsWithInteractions) {
      const existing = dayMap.get(event.date) || [];
      existing.push(event);
      dayMap.set(event.date, existing);
    }

    // Build FeedDay array
    const days: FeedDay[] = [];
    for (const date of dates) {
      const events = dayMap.get(date);
      if (!events || events.length === 0) continue;

      let label: string;
      if (date === today) {
        if (challengeStartDate) {
          const start = parseISO(challengeStartDate);
          const current = parseISO(date);
          const dayNum = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          label = `Today \u2022 Day ${dayNum}`;
        } else {
          label = 'Today';
        }
      } else if (date === yesterday) {
        label = 'Yesterday';
      } else {
        label = format(parseISO(date), 'EEEE, MMM d');
      }

      days.push({ date, label, events });
    }

    return days;
  }, [allEvents, interactions, dates, challengeStartDate, wakeUpTime]);

  // Today's progress for the dual progress header
  const todayDate = dates[0];
  const myTodayLog = myLogs[todayDate] || null;
  const partnerTodayLog = partnerLogs[todayDate] || null;

  const myCompletedCount = myTodayLog
    ? Object.values(myTodayLog.habits).filter((h) => h.completed).length
    : 0;
  const partnerCompletedCount = partnerTodayLog
    ? Object.values(partnerTodayLog.habits).filter((h) => h.completed).length
    : 0;

  // Actions
  const toggleReaction = useCallback(
    async (eventId: string, emoji: string) => {
      if (!userId) return;
      const key = getReactionKey(userId, emoji);
      const existing = interactions[eventId]?.reactions?.[key];
      if (existing) {
        await removeReaction(eventId, userId, emoji);
      } else {
        await addReaction(eventId, userId, emoji);
      }
    },
    [userId, interactions],
  );

  const postComment = useCallback(
    async (eventId: string, text: string) => {
      if (!userId || !text.trim()) return;
      await addComment(eventId, userId, text.trim());
    },
    [userId],
  );

  return {
    feedDays,
    isLoading,
    myName,
    partnerName,
    myTodayLog,
    partnerTodayLog,
    myCompletedCount,
    partnerCompletedCount,
    totalHabits: HABIT_ORDER.length,
    toggleReaction,
    postComment,
    currentUserId: userId || '',
  };
}
