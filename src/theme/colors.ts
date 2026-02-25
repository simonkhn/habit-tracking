export const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#F0F0F0',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // Habit colors
  wakeUpOnTime: '#E67E22',
  morningSunlight: '#F5A623',
  water: '#3498DB',
  journal: '#9B59B6',
  reading: '#27AE60',
  workout: '#E74C3C',
  meditate: '#00BCD4',

  // Semantic
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F5A623',

  // Heatmap levels (0-4)
  heatmap: ['#EBEDF0', '#9BE9A8', '#40C463', '#30A14E', '#216E39'] as const,
} as const;

export type HabitColor = typeof colors[keyof typeof colors];
