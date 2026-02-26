import { BadgeDefinition, BadgeId } from '../types/stats';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Challenge milestones
  { id: 'day7', label: 'Week One', description: 'Reached Day 7', icon: 'star-outline', color: '#F5A623', category: 'challenge' },
  { id: 'day14', label: 'Two Weeks', description: 'Reached Day 14', icon: 'star-outline', color: '#F5A623', category: 'challenge' },
  { id: 'day25', label: 'Chunk Done', description: 'Completed a 25-day chunk', icon: 'trophy-outline', color: '#FFD700', category: 'challenge' },
  { id: 'day50', label: 'Halfway', description: 'Reached Day 50', icon: 'trophy-outline', color: '#FFD700', category: 'challenge' },
  { id: 'day75', label: 'Champion', description: 'Finished the full 75 days', icon: 'ribbon-outline', color: '#E74C3C', category: 'challenge' },
  // Streak milestones
  { id: 'streak7', label: '7-Day Streak', description: 'Any habit, 7 days straight', icon: 'flame-outline', color: '#E67E22', category: 'streak' },
  { id: 'streak14', label: '14-Day Streak', description: 'Any habit, 14 days straight', icon: 'flame-outline', color: '#E67E22', category: 'streak' },
  { id: 'streak25', label: '25-Day Streak', description: 'Any habit, 25 days straight', icon: 'flame-outline', color: '#E74C3C', category: 'streak' },
  // Pair milestones
  { id: 'perfectPair', label: 'Perfect Pair', description: 'Both completed all habits in one day', icon: 'heart-outline', color: '#9B59B6', category: 'pair' },
  { id: 'unstoppable7', label: 'Unstoppable', description: '7 consecutive perfect pair days', icon: 'rocket-outline', color: '#E74C3C', category: 'pair' },
];

export function getBadgeDefinition(id: BadgeId): BadgeDefinition {
  return BADGE_DEFINITIONS.find((b) => b.id === id)!;
}
