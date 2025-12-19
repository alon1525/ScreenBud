/**
 * Points calculation constants and formulas
 */

export const POINTS_CONFIG = {
  // Base points per minute under goal
  POINTS_PER_MINUTE: 10,
  
  // Goal bonus multipliers
  MULTIPLIERS: {
    PERFECT: 2.0,      // 100% under goal
    GREAT: 1.5,        // 75-99% under goal
    GOOD: 1.25,        // 50-74% under goal
    OKAY: 1.0,         // 25-49% under goal
    TOUGH: 0.5,        // 0-24% under goal
    OVER: 0,           // Over goal (no base points)
  },
  
  // Streak bonus
  STREAK_BONUS_PER_DAY: 5,
  MAX_STREAK_BONUS: 100,
  
  // Weekly streak bonus
  WEEKLY_STREAK_BONUS_PER_WEEK: 50,
  
  // XP conversion (points to XP)
  XP_PER_POINT: 0.1,
  
  // Level calculation
  XP_PER_LEVEL: 1000,
  
  // Daily login rewards
  LOGIN_REWARDS: {
    DAY_1: 50,
    DAY_2: 100,
    DAY_3: 150,
    DAY_4: 200,
    DAY_5: 250,
    DAY_6: 300,
    DAY_7: 500,
  },
} as const;

/**
 * Calculate base points based on usage vs goal
 */
export function calculateBasePoints(goalMinutes: number, actualMinutes: number): number {
  const minutesUnderGoal = Math.max(0, goalMinutes - actualMinutes);
  return minutesUnderGoal * POINTS_CONFIG.POINTS_PER_MINUTE;
}

/**
 * Get multiplier based on percentage under goal
 */
export function getGoalMultiplier(goalMinutes: number, actualMinutes: number): number {
  if (actualMinutes >= goalMinutes) {
    return POINTS_CONFIG.MULTIPLIERS.OVER;
  }
  
  const percentageUnder = ((goalMinutes - actualMinutes) / goalMinutes) * 100;
  
  if (percentageUnder >= 100) return POINTS_CONFIG.MULTIPLIERS.PERFECT;
  if (percentageUnder >= 75) return POINTS_CONFIG.MULTIPLIERS.GREAT;
  if (percentageUnder >= 50) return POINTS_CONFIG.MULTIPLIERS.GOOD;
  if (percentageUnder >= 25) return POINTS_CONFIG.MULTIPLIERS.OKAY;
  return POINTS_CONFIG.MULTIPLIERS.TOUGH;
}

/**
 * Calculate streak bonus
 */
export function calculateStreakBonus(streak: number): number {
  return Math.min(streak * POINTS_CONFIG.STREAK_BONUS_PER_DAY, POINTS_CONFIG.MAX_STREAK_BONUS);
}

/**
 * Calculate total daily points
 */
export function calculateDailyPoints(
  goalMinutes: number,
  actualMinutes: number,
  streak: number,
  achievementBonus: number = 0
): number {
  const basePoints = calculateBasePoints(goalMinutes, actualMinutes);
  const multiplier = getGoalMultiplier(goalMinutes, actualMinutes);
  const goalBonus = basePoints * multiplier;
  const streakBonus = calculateStreakBonus(streak);
  
  return Math.round(basePoints + goalBonus + streakBonus + achievementBonus);
}

/**
 * Calculate XP from points
 */
export function pointsToXP(points: number): number {
  return Math.round(points * POINTS_CONFIG.XP_PER_POINT);
}

/**
 * Calculate level from total XP
 */
export function xpToLevel(totalXP: number): number {
  return Math.floor(totalXP / POINTS_CONFIG.XP_PER_LEVEL) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number, currentXP: number): number {
  const nextLevelXP = currentLevel * POINTS_CONFIG.XP_PER_LEVEL;
  return Math.max(0, nextLevelXP - currentXP);
}


