/**
 * React hook for accessing and managing user data
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/firestore';
import { User } from '../types/user';

export function useUser() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authUser?.uid) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Get initial user data
    userService
      .getUser(authUser.uid)
      .then((userData) => {
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading user:', err);
        setError(err);
        setLoading(false);
      });

    // Subscribe to real-time updates
    const unsubscribe = userService.subscribeToUser(authUser.uid, (userData) => {
      setUser(userData);
      setLoading(false);
    });

    return unsubscribe;
  }, [authUser?.uid]);

  /**
   * Update user data
   */
  const updateUser = async (updates: Partial<User>) => {
    if (!authUser?.uid) {
      throw new Error('No authenticated user');
    }

    try {
      await userService.updateUser(authUser.uid, updates);
      // The subscription will automatically update the state
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  /**
   * Refresh user data
   */
  const refresh = async () => {
    if (!authUser?.uid) return;

    setLoading(true);
    try {
      const userData = await userService.getUser(authUser.uid);
      setUser(userData);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    updateUser,
    refresh,
  };
}



