// --- Type ---
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnPrimary: string;

  // Habit colors
  wakeUpOnTime: string;
  morningSunlight: string;
  water: string;
  journal: string;
  reading: string;
  workout: string;
  meditate: string;

  // Semantic
  success: string;
  error: string;
  warning: string;

  // Accent
  accent: string;

  // Chat
  chatBubbleMe: string;
  chatBubblePartner: string;
  chatTextMe: string;
  chatTextPartner: string;
  chatTagIdeaBg: string;
  chatTagIdeaText: string;
  chatTagBugBg: string;
  chatTagBugText: string;
  chatReactionActive: string;

  // Switch
  switchThumbOff: string;

  // Gold / celebration
  goldAccent: string;
  goldAccentBg: string;
  goldAccentBorder: string;

  // Pair streak banner
  pairStreakActiveBg: string;
  pairStreakActiveBorder: string;

  // Chunk grid
  chunkMissed: string;

  // Badge
  badgeEarnedBg: string;
  badgeCheckmark: string;

  // Heatmap levels (0-4)
  heatmap: readonly [string, string, string, string, string];
}

export type HabitColor = string;

// --- Base palette shared by both modes ---
const habitColors = {
  wakeUpOnTime: '#E67E22',
  morningSunlight: '#F5A623',
  water: '#3498DB',
  journal: '#9B59B6',
  reading: '#27AE60',
  workout: '#E74C3C',
  meditate: '#00BCD4',
};

const semanticColors = {
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F5A623',
};

// --- Light theme ---
export const lightColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#F0F0F0',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  ...habitColors,
  ...semanticColors,

  accent: '#3B82F6',

  chatBubbleMe: '#3B82F6',
  chatBubblePartner: '#F3F4F6',
  chatTextMe: '#FFFFFF',
  chatTextPartner: '#1A1A2E',
  chatTagIdeaBg: '#DBEAFE',
  chatTagIdeaText: '#2563EB',
  chatTagBugBg: '#FEE2E2',
  chatTagBugText: '#DC2626',
  chatReactionActive: '#EBF5FB',

  switchThumbOff: '#f4f3f4',

  goldAccent: '#FFD700',
  goldAccentBg: '#FFD70015',
  goldAccentBorder: '#FFD70050',

  pairStreakActiveBg: '#FFF8F0',
  pairStreakActiveBorder: '#E67E22',

  chunkMissed: '#EBEDF0',

  badgeEarnedBg: '#27AE60',
  badgeCheckmark: '#FFFFFF',

  heatmap: ['#EBEDF0', '#9BE9A8', '#40C463', '#30A14E', '#216E39'],
};

// --- Dark theme ---
export const darkColors: ThemeColors = {
  background: '#0F0F14',
  surface: '#1A1A22',
  surfaceElevated: '#24242E',
  border: '#2A2A34',

  textPrimary: '#E8E8ED',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textOnPrimary: '#FFFFFF',

  ...habitColors,
  ...semanticColors,

  accent: '#60A5FA',

  chatBubbleMe: '#3B82F6',
  chatBubblePartner: '#24242E',
  chatTextMe: '#FFFFFF',
  chatTextPartner: '#E8E8ED',
  chatTagIdeaBg: '#1E3A5F',
  chatTagIdeaText: '#93C5FD',
  chatTagBugBg: '#5F1E1E',
  chatTagBugText: '#FCA5A5',
  chatReactionActive: '#1E3A5F',

  switchThumbOff: '#3A3A44',

  goldAccent: '#FFD700',
  goldAccentBg: '#FFD70020',
  goldAccentBorder: '#FFD70040',

  pairStreakActiveBg: '#2A1F14',
  pairStreakActiveBorder: '#E67E22',

  chunkMissed: '#1E1E28',

  badgeEarnedBg: '#27AE60',
  badgeCheckmark: '#FFFFFF',

  heatmap: ['#161B22', '#0E4429', '#006D32', '#26A641', '#39D353'],
};

// Legacy static export for files not yet migrated
export const colors = lightColors;
