/**
 * Usage tracking TypeScript types
 */

export interface DailyUsage {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  goalMinutes: number;
  points: number;
  xp: number;
  underGoal: boolean;
  graceDayUsed: boolean;
  appBreakdown: AppUsage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppUsage {
  packageName: string;
  appName: string;
  appIcon?: string;
  minutes: number;
  points: number;
  underGoal: boolean;
  percentageOfTotal: number;
}

export interface WeeklyStats {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  totalMinutes: number;
  totalPoints: number;
  perfectDays: number; // days 100% under goal
  averageDailyUsage: number;
  leagueId: string;
  rank: number;
  promoted: boolean;
  demoted: boolean;
  dailyBreakdown: DailyUsage[];
}

export interface UsageStats {
  packageName: string;
  totalTimeInForeground: number; // milliseconds
  lastTimeUsed: number; // timestamp
  appName?: string;
}

export interface UsageQueryParams {
  startTime: number; // timestamp
  endTime: number; // timestamp
  packageNames?: string[];
}


