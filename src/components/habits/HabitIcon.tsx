import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface HabitIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function HabitIcon({ name, size = 24, color = '#000' }: HabitIconProps) {
  return <Ionicons name={name as any} size={size} color={color} />;
}
