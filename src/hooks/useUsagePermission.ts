/**
 * Hook to check and manage usage stats permission
 */

import { useState, useEffect, useCallback } from 'react';
import { NativeModules, AppState, AppStateStatus } from 'react-native';

const { UsageStatsModule } = NativeModules;

export function useUsagePermission() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (!UsageStatsModule || !UsageStatsModule.hasUsageStatsPermission) {
      setHasPermission(false);
      setChecking(false);
      return false;
    }

    try {
      setChecking(true);
      // React Native modules with Promise parameter return Promises directly
      const result = await UsageStatsModule.hasUsageStatsPermission();
      setHasPermission(result);
      return result;
    } catch (error) {
      console.error('Error checking usage permission:', error);
      setHasPermission(false);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check when app comes to foreground (user might have granted permission)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  return {
    hasPermission,
    checking,
    checkPermission,
  };
}

