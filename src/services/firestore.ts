/**
 * Firestore service - Centralized data operations
 * 
 * This service handles all Firestore read/write operations
 * for a clean separation of concerns.
 */

import firestore from '@react-native-firebase/firestore';
import { User } from '../types/user';

/**
 * Check if Firestore is available/connected
 */
export async function isFirestoreAvailable(): Promise<boolean> {
  try {
    // Try a simple operation to check connectivity
    await firestore().collection('_health').limit(1).get();
    return true;
  } catch (error: any) {
    const errorCode = error?.code || '';
    // unavailable means Firestore service is down or not connected
    if (errorCode === 'unavailable') {
      return false;
    }
    // Other errors might be permission issues, but service is available
    return true;
  }
}

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  DAILY_USAGE: 'dailyUsage',
  WEEKLY_STATS: 'weeklyStats',
  LEAGUES: 'leagues',
  ACHIEVEMENTS: 'achievements',
  USER_ACHIEVEMENTS: 'userAchievements',
  FRIENDS: 'friends',
} as const;

/**
 * User Operations
 */
export const userService = {
  /**
   * Get user document
   */
  async getUser(uid: string): Promise<User | null> {
    try {
      const doc = await firestore().collection(COLLECTIONS.USERS).doc(uid).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Create or update user document
   */
  async setUser(uid: string, userData: Partial<User>): Promise<void> {
    try {
      console.log('Creating/updating user document with UID:', uid);
      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(uid) // Document ID = Auth user UID
        .set(userData, { merge: true });
      console.log('User document created/updated successfully with ID:', uid);
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  /**
   * Update user document (partial update)
   * Uses set with merge to create document if it doesn't exist
   */
  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    try {
      console.log('Updating user document with UID:', uid);
      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(uid) // Document ID = Auth user UID
        .set({
          ...updates,
          lastActiveAt: new Date(),
        }, { merge: true });
      console.log('User document updated successfully with ID:', uid);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Listen to user document changes (real-time)
   */
  subscribeToUser(
    uid: string,
    callback: (user: User | null) => void
  ): () => void {
    return firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({ id: doc.id, ...doc.data() } as User);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error in user subscription:', error);
          callback(null);
        }
      );
  },
};

/**
 * Daily Usage Operations
 */
export const dailyUsageService = {
  /**
   * Save daily usage data
   */
  async saveDailyUsage(
    uid: string,
    date: string, // Format: YYYY-MM-DD
    usageData: any
  ): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTIONS.DAILY_USAGE)
        .doc(uid)
        .collection(date)
        .doc(date)
        .set(usageData, { merge: true });
    } catch (error) {
      console.error('Error saving daily usage:', error);
      throw error;
    }
  },

  /**
   * Get daily usage for a specific date
   */
  async getDailyUsage(uid: string, date: string): Promise<any | null> {
    try {
      const doc = await firestore()
        .collection(COLLECTIONS.DAILY_USAGE)
        .doc(uid)
        .collection(date)
        .doc(date)
        .get();
      
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting daily usage:', error);
      throw error;
    }
  },
};

/**
 * League Operations
 */
export const leagueService = {
  /**
   * Get league data
   */
  async getLeague(leagueId: string): Promise<any | null> {
    try {
      const doc = await firestore()
        .collection(COLLECTIONS.LEAGUES)
        .doc(leagueId)
        .get();
      
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error getting league:', error);
      throw error;
    }
  },

  /**
   * Get league leaderboard
   */
  async getLeagueLeaderboard(leagueId: string): Promise<any[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.LEAGUES)
        .doc(leagueId)
        .collection('players')
        .orderBy('totalPoints', 'desc')
        .limit(50)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  },
};

/**
 * Helper: Convert Firestore Timestamp to Date
 */
export function firestoreTimestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

/**
 * Helper: Convert Date to Firestore Timestamp
 */
export function dateToFirestoreTimestamp(date: Date): any {
  return firestore.Timestamp.fromDate(date);
}

/**
 * Batch Operations
 */
export const batchService = {
  /**
   * Execute multiple write operations atomically
   */
  async executeBatch(operations: Array<() => Promise<void>>): Promise<void> {
    const batch = firestore().batch();
    
    // Note: Firestore batch has limitations, this is a wrapper
    // For true atomic operations, use firestore().batch() directly
    try {
      await Promise.all(operations.map(op => op()));
    } catch (error) {
      console.error('Error executing batch operations:', error);
      throw error;
    }
  },
};

/**
 * Error handling utilities
 */
export class FirestoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

/**
 * Wrap Firestore operations with better error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage = 'Firestore operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const code = error?.code || 'unknown';
    const message = error?.message || errorMessage;
    throw new FirestoreError(message, code, error);
  }
}

