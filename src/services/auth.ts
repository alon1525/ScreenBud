/**
 * Authentication service using Firebase Auth
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types/user';
import { userService } from './firestore';

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  username?: string;
}

/**
 * Sign in anonymously with retry logic for transient errors
 * IMPORTANT: Always checks for existing user first to avoid creating duplicates
 */
async function signInAnonymouslyWithRetry(maxRetries = 3, delay = 1000): Promise<AuthUser> {
  // FIRST: Check if there's already a signed-in user
  const currentUser = auth().currentUser;
  if (currentUser && currentUser.isAnonymous) {
    // User already exists, just get their data
    try {
      const existingUser = await userService.getUser(currentUser.uid);
      return {
        uid: currentUser.uid,
        isAnonymous: currentUser.isAnonymous,
        username: existingUser?.username || undefined,
      };
    } catch (error) {
      // If we can't get user data, continue to sign in flow
      console.warn('Could not get existing user data, continuing sign in:', error);
    }
  }

  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check again before signing in (might have been created in previous attempt)
      const existingAuthUser = auth().currentUser;
      if (existingAuthUser && existingAuthUser.isAnonymous) {
        const existingUser = await userService.getUser(existingAuthUser.uid);
        return {
          uid: existingAuthUser.uid,
          isAnonymous: existingAuthUser.isAnonymous,
          username: existingUser?.username || undefined,
        };
      }

      // Sign in anonymously (only if no user exists)
      console.log('Attempting to sign in anonymously...');
      const userCredential = await auth().signInAnonymously();
      const user = userCredential.user;
      console.log('Anonymous sign-in successful! User ID:', user.uid);

      // Check if user document exists in Firestore
      let existingUser: User | null = null;
      try {
        existingUser = await userService.getUser(user.uid);
      } catch (error: any) {
        // If document doesn't exist (not-found), that's fine - we'll create it
        if (error?.code !== 'firestore/not-found' && error?.code !== 'not-found') {
          console.warn('Error checking for existing user, will try to create:', error);
        }
      }

      if (!existingUser) {
        // Create new user document with default values
        const newUser: Partial<User> = {
          id: user.uid,
          username: '', // Will be set in username setup screen
          avatar: '', // Default avatar
          level: 1,
          totalXP: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
          leagueId: 'bronze',
          leagueTier: 'bronze',
          dailyGoal: 120, // Default 2 hours
          trackedApps: [],
          createdAt: new Date(),
          lastActiveAt: new Date(),
          settings: {
            notifications: true,
            shareProgress: true,
            anonymousMode: true,
            theme: 'light',
            pushNotifications: {
              milestones: true,
              achievements: true,
              leagueUpdates: true,
              friendActivity: false,
            },
          },
        };

        try {
          console.log('Creating user document for Auth UID:', user.uid);
          await userService.setUser(user.uid, newUser);
          console.log('User document created successfully for UID:', user.uid);
          
          // Re-fetch the document after creating it
          existingUser = await userService.getUser(user.uid);
          console.log('Fetched user document, UID matches:', existingUser?.id === user.uid);
        } catch (createError: any) {
          console.error('Error creating user document:', createError);
          // If it's a permission error, throw it so retry logic can handle it
          if (createError?.code === 'firestore/permission-denied' || createError?.code === 'permission-denied') {
            throw createError;
          }
          // For other errors, continue - user might still be created
        }
      }

      // Get username from user data
      const username = existingUser?.username || undefined;

      return {
        uid: user.uid,
        isAnonymous: user.isAnonymous,
        username,
      };
    } catch (error: any) {
      lastError = error;
      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';
      
      console.error(`Sign-in attempt ${attempt + 1} failed:`, errorCode, errorMessage);
      
      // Don't retry on permission errors - these are not transient
      if (errorCode === 'firestore/permission-denied' || errorCode === 'permission-denied') {
        console.error('Permission denied - cannot create user. Make sure Firestore rules are published!');
        throw error; // Fail immediately on permission errors
      }
      
      // Don't retry on auth configuration errors
      if (errorCode === 'auth/operation-not-allowed') {
        console.error('Anonymous auth is not enabled in Firebase Console!');
        throw new Error('Anonymous authentication is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Anonymous.');
      }
      
      // Check if it's a transient error that we should retry
      const isTransientError = 
        errorCode === 'auth/network-request-failed' ||
        errorCode === 'unavailable' ||
        error?.message?.toLowerCase().includes('transient') ||
        error?.message?.toLowerCase().includes('unavailable');
      
      if (isTransientError && attempt < maxRetries - 1) {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Sign in anonymously and create user document in Firestore if it doesn't exist
 */
export async function signInAnonymously(): Promise<AuthUser> {
  try {
    console.log('=== Starting anonymous sign-in ===');
    const result = await signInAnonymouslyWithRetry();
    console.log('=== Sign-in successful ===', result.uid);
    return result;
  } catch (error: any) {
    console.error('=== Sign-in FAILED ===');
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    console.error('Full error:', error);
    
    // If anonymous auth is not enabled, provide clear instructions
    if (error?.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Anonymous authentication is not enabled!\n\n' +
        'To enable it:\n' +
        '1. Go to Firebase Console\n' +
        '2. Authentication → Sign-in method\n' +
        '3. Find "Anonymous" and click Enable\n' +
        '4. Save and restart the app'
      );
    }
    
    throw error;
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): AuthUser | null {
  const user = auth().currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
  };
}

/**
 * Check if user has username set (fast fail for unavailable errors)
 */
export async function hasUsername(uid: string): Promise<boolean> {
  // Timeout for initial check - fail fast if Firestore is unavailable
  const timeoutMs = 3000; // 3 seconds
  
  try {
    console.log('Checking username for user:', uid);
    const startTime = Date.now();
    
    const userDoc = await Promise.race([
      firestore().collection('users').doc(uid).get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
    ]) as any;
    
    const duration = Date.now() - startTime;
    console.log(`Username check completed in ${duration}ms`);
    
    // Document doesn't exist = no username
    if (!userDoc.exists) {
      console.log('User document does not exist - no username');
      return false;
    }
    
    const userData = userDoc.data();
    const hasUsernameValue = !!userData?.username && userData.username.trim().length > 0;
    console.log('Username check result:', hasUsernameValue ? `"${userData.username}"` : 'none');
    return hasUsernameValue;
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';
    
    console.warn('Username check error:', errorCode, errorMessage);
    
    // Document not found = no username (this is expected for new users)
    if (errorCode === 'firestore/not-found' || errorCode === 'not-found' || errorMessage.includes('not found')) {
      console.log('Document not found - no username');
      return false;
    }
    
    // If Firestore is unavailable or timeout, fail fast and assume no username
    // This prevents the app from hanging on startup
    if (errorCode === 'unavailable' || errorCode === 'deadline-exceeded' || errorMessage.includes('Timeout')) {
      console.warn('Firestore unavailable or timeout, assuming no username to show setup screen');
      return false;
    }
    
    // Permission denied - document might not exist or rules might be blocking
    if (errorCode === 'firestore/permission-denied' || errorCode === 'permission-denied') {
      console.warn('Permission denied - assuming no username (document may not exist)');
      return false;
    }
    
    // For other errors, also assume no username (safer default)
    console.warn('Error checking username, assuming no username:', error?.message || error);
    return false;
  }
}

/**
 * Check if a username already exists (excluding current user)
 * Handles unavailable errors gracefully
 */
export async function usernameExists(username: string, excludeUserId?: string): Promise<boolean> {
  try {
    const query = firestore()
      .collection('users')
      .where('username', '==', username)
      .limit(1);

    // Add timeout - fail fast if Firestore is unavailable
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 3000);
    });

    const queryPromise = query.get();
    const snapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    if (snapshot.empty) return false;
    
    // If checking for specific user, exclude their own username
    if (excludeUserId) {
      const doc = snapshot.docs[0];
      return doc.id !== excludeUserId;
    }
    
    return true;
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';
    
    // If Firestore is unavailable, throw a user-friendly error
    if (errorCode === 'unavailable') {
      throw new Error(
        'Firestore service is currently unavailable. Please check your internet connection and try again.'
      );
    }
    
    // If it's an index error, throw with helpful message
    if (errorCode === 'failed-precondition' || errorMessage.includes('index')) {
      const indexError = error?.message || '';
      // Extract the index creation URL if present
      const urlMatch = indexError.match(/https:\/\/[^\s]+/);
      const urlMessage = urlMatch 
        ? `\n\nClick this link to create the index:\n${urlMatch[0]}`
        : '\n\nGo to Firebase Console → Firestore → Indexes → Create Index for "users" collection with "username" field.';
      
      throw new Error(
        `Firestore index required for username queries.${urlMessage}`
      );
    }
    
    // If timeout
    if (errorMessage.includes('timeout')) {
      throw new Error('Connection timeout. Please check your internet connection.');
    }
    
    // For other errors, throw with original message
    throw new Error(errorMessage || 'Failed to check username availability');
  }
}

/**
 * Set username for user (ensures uniqueness)
 * Only stores the username field, not firstName/nickname separately
 */
export async function setUsername(uid: string, firstName: string, nickname: string): Promise<void> {
  try {
    const username = `${firstName} ${nickname}`.trim();
    
    console.log('Setting username for Auth UID:', uid);
    
    // Check if username already exists
    const exists = await usernameExists(username, uid);
    if (exists) {
      throw new Error('This username is already taken. Please choose a different one.');
    }
    
    // Only save username field - document ID will be the Auth UID
    await userService.updateUser(uid, {
      username,
    });
    
    console.log('Username set successfully for UID:', uid);
  } catch (error) {
    console.error('Error setting username:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

