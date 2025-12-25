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
        // These keys should directly match the DailyStats field names
        
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
        console.log('Raw stats keys:', Object.keys(stats));
        console.log('Raw stats values:', Object.values(stats));

        // Direct mapping - native module keys should match DailyStats field names
        for (const [key, minutes] of Object.entries(stats)) {
          // Check if the key is a valid field in dailyStats
          if (key in dailyStats && typeof minutes === 'number') {
            const fieldName = key as keyof typeof dailyStats;
            // Ensure we're setting a number field, not updatedAt
            if (fieldName !== 'updatedAt') {
              dailyStats[fieldName] = Math.round(minutes);
              console.log(`Mapped ${key}: ${minutes} -> ${Math.round(minutes)} minutes`);
            }
          } else {
            console.warn(`Unknown or invalid key from native module: ${key} = ${minutes} (type: ${typeof minutes})`);
          }
        }

        console.log('Daily stats to upload:', dailyStats);
        console.log('User UID:', user.uid);
        console.log('Today date:', today);

        // Set the complete daily stats (replaces any existing data for today)
        await socialMediaTrackingService.setDailyStats(
          user.uid,
          today,
          dailyStats
        );

        console.log('✅ Stats uploaded successfully to Firestore');
        console.log('Path: users/' + user.uid + '/dailyStats/' + today);
      } catch (error: any) {
        if (error?.code !== 'PERMISSION_DENIED') {
          console.error('Error uploading stats:', error);
        }
      }
    };

    uploadStats();
  }, [user?.uid, hasUsername]); // Only run when user ID or username status changes
}

