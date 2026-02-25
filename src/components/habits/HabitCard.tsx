import React from 'react';
import { HabitId, DayHabits, WaterHabitData, ReadingHabitData, WorkoutHabitData } from '../../types/habit';
import { getHabitDefinition } from '../../config/habits';
import { BinaryHabitCard } from './BinaryHabitCard';
import { ProgressiveHabitCard } from './ProgressiveHabitCard';
import { WorkoutHabitCard } from './WorkoutHabitCard';

interface HabitCardProps {
  habitId: HabitId;
  habits: DayHabits;
  onToggleBinary: (id: HabitId) => void;
  onUpdateWater: (oz: number) => void;
  onUpdateReading: (pages: number) => void;
  onSaveWorkoutNote: (note: string) => void;
}

export function HabitCard({
  habitId,
  habits,
  onToggleBinary,
  onUpdateWater,
  onUpdateReading,
  onSaveWorkoutNote,
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
    case 'binary-with-note':
      return (
        <WorkoutHabitCard
          definition={definition}
          data={data as WorkoutHabitData}
          onToggle={() => onToggleBinary(habitId)}
          onSaveNote={onSaveWorkoutNote}
        />
      );
    default:
      return null;
  }
}
