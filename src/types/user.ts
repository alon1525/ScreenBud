/**
 * User-related TypeScript types
 */

export interface User {
  id: string;
  username: string;
  firstName?: string; // Added for username setup
  nickname?: string; // Added for username setup
  email?: string;
  avatar: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  leagueId: string;
  leagueTier: 'bronze' | 'silver' | 'gold';
  dailyGoal: number; // minutes
  trackedApps: string[]; // package names
  createdAt: Date;
  lastActiveAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: boolean;
  shareProgress: boolean;
  anonymousMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  pushNotifications: {
    milestones: boolean;
    achievements: boolean;
    leagueUpdates: boolean;
    friendActivity: boolean;
  };
}

export interface UserProfile {
  user: User;
  achievements: Achievement[];
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'level_up' | 'achievement' | 'streak' | 'league_promotion';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}


