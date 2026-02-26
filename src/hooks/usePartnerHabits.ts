import { useEffect, useState } from 'react';
import { HabitLog } from '../types/habit';
import { subscribeToDayLog } from '../services/firestore';
import { getHabitDateString } from '../utils/dates';
import { useAuthStore } from '../stores/authStore';

export function usePartnerHabits() {
  const { profile } = useAuthStore();
  const [partnerLog, setPartnerLog] = useState<HabitLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const partnerId = profile?.partnerId;
  const date = getHabitDateString(profile?.wakeUpTime ?? '06:00');

  useEffect(() => {
    if (!partnerId) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToDayLog(partnerId, date, (log) => {
      setPartnerLog(log);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [partnerId, date]);

  const completedCount = partnerLog
    ? Object.values(partnerLog.habits).filter((h) => h.completed).length
    : 0;

  return { partnerLog, isLoading, completedCount };
}
