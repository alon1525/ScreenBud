/**
 * Achievement TypeScript types
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'usage' | 'competition' | 'social';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // 0-100 for in-progress
  maxProgress?: number;
  isUnlocked: boolean;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  maxProgress?: number;
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  maxProgress: number;
  percentage: number;
  isUnlocked: boolean;
}

export interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}


