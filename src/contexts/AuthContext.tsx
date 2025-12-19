/**
 * Authentication Context
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { signInAnonymously, hasUsername, AuthUser } from '../services/auth';
import { userService } from '../services/firestore';
import { User } from '../types/user';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  hasUsername: boolean;
  usernameLoading: boolean;
  refreshUsername: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUsernameValue, setHasUsernameValue] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(true);

  const checkUsername = useCallback(async (uid: string) => {
    try {
      const userHasUsername = await hasUsername(uid);
      setHasUsernameValue(userHasUsername);
      return userHasUsername;
    } catch (error) {
      console.error('Error checking username:', error);
      // On error, assume no username to show setup screen (safer default)
      setHasUsernameValue(false);
      return false;
    }
  }, []);

  const refreshUsername = useCallback(async () => {
    if (user) {
      setUsernameLoading(true);
      await checkUsername(user.uid);
      setUsernameLoading(false);
    }
  }, [user, checkUsername]);

  useEffect(() => {
    let isMounted = true;
    let processedUserId: string | null = null; // Track which user we've already processed
    let usernameCheckTimeout: NodeJS.Timeout | null = null;
    
    console.log('=== AuthProvider mounted, setting up auth listener ===');
    
    // Listen for auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (!isMounted) return;
      
      // Prevent processing the same user twice
      if (firebaseUser && processedUserId === firebaseUser.uid) {
        console.log('User already processed, skipping:', firebaseUser.uid);
        return;
      }
      
      // Clear any existing timeout
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
        usernameCheckTimeout = null;
      }
      
      if (firebaseUser) {
        processedUserId = firebaseUser.uid;
        console.log('Processing user:', firebaseUser.uid);
        
        setUser({
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
        });
        setLoading(false);
        
        // Check username ONCE
        setUsernameLoading(true);
        usernameCheckTimeout = setTimeout(() => {
          if (!isMounted) return;
          setHasUsernameValue(false);
          setUsernameLoading(false);
        }, 3000);
        
        try {
          const hasUsernameResult = await checkUsername(firebaseUser.uid);
          console.log('checkUsername returned:', hasUsernameResult);
          console.log('hasUsernameValue state will be set to:', hasUsernameResult);
          
          // If no username and no document exists, create the user document
          if (!hasUsernameResult) {
            try {
              const existingDoc = await userService.getUser(firebaseUser.uid).catch(() => null);
              if (!existingDoc) {
                await userService.setUser(firebaseUser.uid, {
                  id: firebaseUser.uid,
                  username: '',
                  avatar: '',
                  level: 1,
                  totalXP: 0,
                  currentStreak: 0,
                  longestStreak: 0,
                  totalPoints: 0,
                  leagueId: 'bronze',
                  leagueTier: 'bronze',
                  dailyGoal: 120,
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
                } as Partial<User>);
              }
            } catch (createError) {
              console.error('Error creating user document:', createError);
            }
          }
          
          if (isMounted && usernameCheckTimeout) {
            clearTimeout(usernameCheckTimeout);
            usernameCheckTimeout = null;
          }
        } catch (error) {
          if (isMounted) {
            setHasUsernameValue(false);
            if (usernameCheckTimeout) {
              clearTimeout(usernameCheckTimeout);
              usernameCheckTimeout = null;
            }
          }
        } finally {
          if (isMounted) {
            setUsernameLoading(false);
          }
        }
      } else {
        // No user - sign in anonymously
        processedUserId = null;
        setLoading(true);
        
        try {
          const authUser = await signInAnonymously();
          
          if (!isMounted) return;
          
          processedUserId = authUser.uid;
          setUser(authUser);
          setLoading(false);
          
          // Check username ONCE
          setUsernameLoading(true);
          usernameCheckTimeout = setTimeout(() => {
            if (!isMounted) return;
            setHasUsernameValue(false);
            setUsernameLoading(false);
          }, 3000);
          
          try {
            await checkUsername(authUser.uid);
            if (isMounted && usernameCheckTimeout) {
              clearTimeout(usernameCheckTimeout);
              usernameCheckTimeout = null;
            }
          } catch (error) {
            if (isMounted) {
              setHasUsernameValue(false);
              if (usernameCheckTimeout) {
                clearTimeout(usernameCheckTimeout);
                usernameCheckTimeout = null;
              }
            }
          } finally {
            if (isMounted) {
              setUsernameLoading(false);
            }
          }
        } catch (error: any) {
          if (!isMounted) return;
          
          console.error('Error signing in anonymously:', error);
          setUser(null);
          setLoading(false);
          setUsernameLoading(false);
        }
      }
    });
    
    return () => {
      isMounted = false;
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }
      unsubscribe();
    };
  }, [checkUsername]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasUsername: hasUsernameValue,
        usernameLoading,
        refreshUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

