/**
 * Points and XP TypeScript types
 */

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'daily' | 'bonus' | 'achievement' | 'streak' | 'challenge' | 'login_reward';
  source: string; // e.g., "daily-usage", "7-day-streak", "first-clean-day"
  date: string; // YYYY-MM-DD
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface PointsCalculation {
  basePoints: number;
  goalBonus: number;
  streakBonus: number;
  achievementBonus: number;
  totalPoints: number;
  multiplier: number;
}

export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  progressPercentage: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  graceDaysRemaining: number;
  graceDaysUsedThisWeek: number;
  lastActiveDate: string; // YYYY-MM-DD
}


