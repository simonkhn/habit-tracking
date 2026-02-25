import React from 'react';
import { HabitId, DayHabits } from '../../types/habit';
import { getHabitDefinition } from '../../config/habits';
import { BinaryHabitCard } from './BinaryHabitCard';
import { ProgressiveHabitCard } from './ProgressiveHabitCard';
import { JournalHabitCard } from './JournalHabitCard';
import { WaterHabitData, ReadingHabitData, JournalHabitData } from '../../types/habit';

interface HabitCardProps {
  habitId: HabitId;
  habits: DayHabits;
  onToggleBinary: (id: HabitId) => void;
  onUpdateWater: (oz: number) => void;
  onUpdateReading: (pages: number) => void;
  onSaveJournal: (text: string) => void;
}

export function HabitCard({
  habitId,
  habits,
  onToggleBinary,
  onUpdateWater,
  onUpdateReading,
  onSaveJournal,
}: HabitCardProps) {
  const definition = getHabitDefinition(habitId);
  const data = habits[habitId];

  switch (definition.type) {
    case 'binary':
      return (
        <BinaryHabitCard
          definition={definition}
          data={data}
          onToggle={() => onToggleBinary(habitId)}
        />
      );
    case 'progressive':
      if (habitId === 'water') {
        return (
          <ProgressiveHabitCard
            definition={definition}
            data={data as WaterHabitData}
            onUpdate={onUpdateWater}
          />
        );
      }
      return (
        <ProgressiveHabitCard
          definition={definition}
          data={data as ReadingHabitData}
          onUpdate={onUpdateReading}
        />
      );
    case 'journal':
      return (
        <JournalHabitCard
          definition={definition}
          data={data as JournalHabitData}
          onSave={onSaveJournal}
        />
      );
    default:
      return null;
  }
}
