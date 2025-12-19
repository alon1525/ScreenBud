/**
 * Social Media Usage Tracking Service
 * Handles Firestore operations for daily, weekly, and monthly stats
 */

import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';

export interface DailyStats {
  tiktokMinutes: number;
  instagramMinutes: number;
  youtubeMinutes: number;
  facebookMinutes: number;
  snapchatMinutes: number;
  updatedAt: Date;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  tiktokMinutes: number;
  instagramMinutes: number;
  youtubeMinutes: number;
  facebookMinutes: number;
  snapchatMinutes: number;
  totalMinutes: number;
}

export interface MonthlyStats {
  monthStart: Date;
  monthEnd: Date;
  tiktokMinutes: number;
  instagramMinutes: number;
  youtubeMinutes: number;
  facebookMinutes: number;
  snapchatMinutes: number;
  totalMinutes: number;
}

// App package names mapping
export const APP_PACKAGES = {
  tiktok: 'com.zhiliaoapp.musically',
  instagram: 'com.instagram.android',
  youtube: 'com.google.android.youtube',
  facebook: 'com.facebook.katana',
  snapchat: 'com.snapchat.android',
} as const;

export type SocialApp = keyof typeof APP_PACKAGES;

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get week ID in YYYY-W## format (ISO week)
 */
export function getWeekId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Get month ID in YYYY-MM format
 */
export function getMonthId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get ISO week number
 */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get start and end dates for a week
 */
export function getWeekDates(weekId: string): { start: Date; end: Date } {
  const [year, week] = weekId.split('-W').map(Number);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
  ISOweekEnd.setHours(23, 59, 59, 999);
  
  return {
    start: ISOweekStart,
    end: ISOweekEnd,
  };
}

/**
 * Get start and end dates for a month
 */
export function getMonthDates(monthId: string): { start: Date; end: Date } {
  const [year, month] = monthId.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Social Media Tracking Service
 */
export const socialMediaTrackingService = {
  /**
   * Get or create today's daily stats document
   */
  async getTodayStats(uid: string): Promise<DailyStats | null> {
    try {
      const today = getTodayDateString();
      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .collection('dailyStats')
        .doc(today)
        .get();

      if (doc.exists) {
        const data = doc.data();
        return {
          tiktokMinutes: data?.tiktokMinutes || 0,
          instagramMinutes: data?.instagramMinutes || 0,
          youtubeMinutes: data?.youtubeMinutes || 0,
          facebookMinutes: data?.facebookMinutes || 0,
          snapchatMinutes: data?.snapchatMinutes || 0,
          updatedAt: data?.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting today stats:', error);
      throw error;
    }
  },

  /**
   * Update daily stats for today (incremental)
   */
  async updateTodayStats(
    uid: string,
    app: SocialApp,
    minutes: number
  ): Promise<void> {
    try {
      const today = getTodayDateString();
      const fieldName = `${app}Minutes` as keyof DailyStats;
      
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('dailyStats')
        .doc(today)
        .set(
          {
            [fieldName]: firestore.FieldValue.increment(minutes),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
    } catch (error) {
      console.error('Error updating today stats:', error);
      throw error;
    }
  },

  /**
   * Set complete daily stats (for bulk updates)
   */
  async setDailyStats(
    uid: string,
    date: string,
    stats: DailyStats
  ): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('dailyStats')
        .doc(date)
        .set({
          ...stats,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch (error) {
      console.error('Error setting daily stats:', error);
      throw error;
    }
  },

  /**
   * Get daily stats for a specific date
   */
  async getDailyStats(uid: string, date: string): Promise<DailyStats | null> {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .collection('dailyStats')
        .doc(date)
        .get();

      if (doc.exists) {
        const data = doc.data();
        return {
          tiktokMinutes: data?.tiktokMinutes || 0,
          instagramMinutes: data?.instagramMinutes || 0,
          youtubeMinutes: data?.youtubeMinutes || 0,
          facebookMinutes: data?.facebookMinutes || 0,
          snapchatMinutes: data?.snapchatMinutes || 0,
          updatedAt: data?.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting daily stats:', error);
      throw error;
    }
  },

  /**
   * Get all daily stats for date range
   */
  async getDailyStatsRange(
    uid: string,
    startDate: string,
    endDate: string
  ): Promise<Map<string, DailyStats>> {
    try {
      const snapshot = await firestore()
        .collection('users')
        .doc(uid)
        .collection('dailyStats')
        .where(firestore.FieldPath.documentId(), '>=', startDate)
        .where(firestore.FieldPath.documentId(), '<=', endDate)
        .get();

      const statsMap = new Map<string, DailyStats>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        statsMap.set(doc.id, {
          tiktokMinutes: data?.tiktokMinutes || 0,
          instagramMinutes: data?.instagramMinutes || 0,
          youtubeMinutes: data?.youtubeMinutes || 0,
          facebookMinutes: data?.facebookMinutes || 0,
          snapchatMinutes: data?.snapchatMinutes || 0,
          updatedAt: data?.updatedAt?.toDate() || new Date(),
        });
      });
      return statsMap;
    } catch (error) {
      console.error('Error getting daily stats range:', error);
      throw error;
    }
  },

  /**
   * Aggregate weekly stats from daily stats
   */
  async aggregateWeeklyStats(uid: string, weekId: string): Promise<void> {
    try {
      const { start, end } = getWeekDates(weekId);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const dailyStats = await this.getDailyStatsRange(uid, startDate, endDate);

      const aggregated: WeeklyStats = {
        weekStart: start,
        weekEnd: end,
        tiktokMinutes: 0,
        instagramMinutes: 0,
        youtubeMinutes: 0,
        facebookMinutes: 0,
        snapchatMinutes: 0,
        totalMinutes: 0,
      };

      dailyStats.forEach((stats) => {
        aggregated.tiktokMinutes += stats.tiktokMinutes;
        aggregated.instagramMinutes += stats.instagramMinutes;
        aggregated.youtubeMinutes += stats.youtubeMinutes;
        aggregated.facebookMinutes += stats.facebookMinutes;
        aggregated.snapchatMinutes += stats.snapchatMinutes;
      });

      aggregated.totalMinutes =
        aggregated.tiktokMinutes +
        aggregated.instagramMinutes +
        aggregated.youtubeMinutes +
        aggregated.facebookMinutes +
        aggregated.snapchatMinutes;

      await firestore()
        .collection('users')
        .doc(uid)
        .collection('weeklyStats')
        .doc(weekId)
        .set(aggregated);
    } catch (error) {
      console.error('Error aggregating weekly stats:', error);
      throw error;
    }
  },

  /**
   * Aggregate monthly stats from daily stats
   */
  async aggregateMonthlyStats(uid: string, monthId: string): Promise<void> {
    try {
      const { start, end } = getMonthDates(monthId);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const dailyStats = await this.getDailyStatsRange(uid, startDate, endDate);

      const aggregated: MonthlyStats = {
        monthStart: start,
        monthEnd: end,
        tiktokMinutes: 0,
        instagramMinutes: 0,
        youtubeMinutes: 0,
        facebookMinutes: 0,
        snapchatMinutes: 0,
        totalMinutes: 0,
      };

      dailyStats.forEach((stats) => {
        aggregated.tiktokMinutes += stats.tiktokMinutes;
        aggregated.instagramMinutes += stats.instagramMinutes;
        aggregated.youtubeMinutes += stats.youtubeMinutes;
        aggregated.facebookMinutes += stats.facebookMinutes;
        aggregated.snapchatMinutes += stats.snapchatMinutes;
      });

      aggregated.totalMinutes =
        aggregated.tiktokMinutes +
        aggregated.instagramMinutes +
        aggregated.youtubeMinutes +
        aggregated.facebookMinutes +
        aggregated.snapchatMinutes;

      await firestore()
        .collection('users')
        .doc(uid)
        .collection('monthlyStats')
        .doc(monthId)
        .set(aggregated);
    } catch (error) {
      console.error('Error aggregating monthly stats:', error);
      throw error;
    }
  },

  /**
   * Delete daily stats older than specified days
   */
  async deleteOldDailyStats(uid: string, keepDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      const snapshot = await firestore()
        .collection('users')
        .doc(uid)
        .collection('dailyStats')
        .where(firestore.FieldPath.documentId(), '<', cutoffDateString)
        .get();

      const batch = firestore().batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted ${snapshot.size} old daily stats documents`);
    } catch (error) {
      console.error('Error deleting old daily stats:', error);
      throw error;
    }
  },

  /**
   * Get weekly stats
   */
  async getWeeklyStats(uid: string, weekId: string): Promise<WeeklyStats | null> {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .collection('weeklyStats')
        .doc(weekId)
        .get();

      if (doc.exists) {
        const data = doc.data();
        return {
          weekStart: data?.weekStart?.toDate() || new Date(),
          weekEnd: data?.weekEnd?.toDate() || new Date(),
          tiktokMinutes: data?.tiktokMinutes || 0,
          instagramMinutes: data?.instagramMinutes || 0,
          youtubeMinutes: data?.youtubeMinutes || 0,
          facebookMinutes: data?.facebookMinutes || 0,
          snapchatMinutes: data?.snapchatMinutes || 0,
          totalMinutes: data?.totalMinutes || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      throw error;
    }
  },

  /**
   * Get monthly stats
   */
  async getMonthlyStats(uid: string, monthId: string): Promise<MonthlyStats | null> {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .collection('monthlyStats')
        .doc(monthId)
        .get();

      if (doc.exists) {
        const data = doc.data();
        return {
          monthStart: data?.monthStart?.toDate() || new Date(),
          monthEnd: data?.monthEnd?.toDate() || new Date(),
          tiktokMinutes: data?.tiktokMinutes || 0,
          instagramMinutes: data?.instagramMinutes || 0,
          youtubeMinutes: data?.youtubeMinutes || 0,
          facebookMinutes: data?.facebookMinutes || 0,
          snapchatMinutes: data?.snapchatMinutes || 0,
          totalMinutes: data?.totalMinutes || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      throw error;
    }
  },
};

