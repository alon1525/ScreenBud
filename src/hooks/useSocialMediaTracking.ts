/**
 * React Native hook for social media usage tracking
 * Checks username on app open and uploads stats if user has username
 */

import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { socialMediaTrackingService, getTodayDateString } from '../services/socialMediaTracking';

const { UsageStatsModule } = NativeModules;

export function useSocialMediaTracking() {
  const { user, hasUsername } = useAuth();

  /**
   * Check username on app open and upload stats if user has username
   */
  useEffect(() => {
    // Only check once when app opens and user has username
    if (!user || !hasUsername || !UsageStatsModule) {
      return;
    }

    // Check permission and upload stats
    const uploadStats = async () => {
      try {
        // Check permission
        const hasPermission = await UsageStatsModule.hasUsageStatsPermission();
        if (!hasPermission) {
          return;
        }

        // Get today's stats
        const stats = await UsageStatsModule.getTodayUsageStats();
        if (!stats) {
          return;
        }

        // Upload to Firestore
        // Native module returns keys like "tiktokMinutes", "instagramMinutes", etc. (with "Minutes" suffix)
        const appMapping: Record<string, 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'snapchat'> = {
          tiktokMinutes: 'tiktok',
          instagramMinutes: 'instagram',
          youtubeMinutes: 'youtube',
          facebookMinutes: 'facebook',
          snapchatMinutes: 'snapchat',
        };

        // Use setDailyStats to replace today's data instead of incrementing
        // This prevents duplicate data if the app is opened multiple times
        const today = getTodayDateString();
        const dailyStats = {
          tiktokMinutes: 0,
          instagramMinutes: 0,
          youtubeMinutes: 0,
          facebookMinutes: 0,
          snapchatMinutes: 0,
          updatedAt: new Date(),
        };

        console.log('Raw stats from native module:', stats);

        for (const [key, minutes] of Object.entries(stats)) {
          const app = appMapping[key as keyof typeof appMapping];
          if (app) {
            const fieldName = `${app}Minutes` as keyof typeof dailyStats;
            if (fieldName in dailyStats) {
              dailyStats[fieldName] = Math.round(minutes);
            }
          } else {
            console.log(`Unknown key from native module: ${key}`);
          }
        }

        console.log('Daily stats to upload:', dailyStats);

        // Set the complete daily stats (replaces any existing data for today)
        await socialMediaTrackingService.setDailyStats(
          user.uid,
          today,
          dailyStats
        );
      } catch (error: any) {
        if (error?.code !== 'PERMISSION_DENIED') {
          console.error('Error uploading stats:', error);
        }
      }
    };

    uploadStats();
  }, [user?.uid, hasUsername]); // Only run when user ID or username status changes
}

