/**
 * Social Media Tracking Screen
 * Example integration of usage tracking
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useSocialMediaTracking } from '../hooks/useSocialMediaTracking';
import { socialMediaTrackingService, getTodayDateString } from '../services/socialMediaTracking';
import { Colors } from '../constants/colors';
import { NativeModules } from 'react-native';

const { UsageStatsModule } = NativeModules;

export const SocialMediaTracking: React.FC = () => {
  const { user } = useAuth();
  const { uploadStats } = useSocialMediaTracking();
  const [todayStats, setTodayStats] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPermission();
    loadTodayStats();
  }, [user]);

  const checkPermission = async () => {
    try {
      const hasPerm = await UsageStatsModule?.hasUsageStatsPermission();
      setHasPermission(hasPerm);
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const requestPermission = () => {
    Alert.alert(
      'Usage Stats Permission Required',
      'This app needs usage stats permission to track social media usage. Please grant permission in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            // This will open Android settings
            // You may need to create a native module for this
            UsageStatsModule?.openUsageStatsSettings?.();
          },
        },
      ]
    );
  };

  const loadTodayStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = getTodayDateString();
      const stats = await socialMediaTrackingService.getTodayStats(user.uid);
      setTodayStats(stats);
    } catch (error) {
      console.error('Error loading today stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    if (!hasPermission) {
      requestPermission();
      return;
    }

    try {
      setLoading(true);
      const stats = await UsageStatsModule?.getTodayUsageStats();
      if (stats) {
        const today = getTodayDateString();
        await uploadStats(stats, today);
        await loadTodayStats();
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      Alert.alert('Error', 'Failed to refresh usage stats');
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Permission Required</Text>
          <Text style={styles.permissionText}>
            This app needs usage stats permission to track your social media usage.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Usage</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshStats}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {todayStats && (
          <View style={styles.statsContainer}>
            <StatCard app="TikTok" minutes={todayStats.tiktokMinutes} />
            <StatCard app="Instagram" minutes={todayStats.instagramMinutes} />
            <StatCard app="YouTube" minutes={todayStats.youtubeMinutes} />
            <StatCard app="Facebook" minutes={todayStats.facebookMinutes} />
            <StatCard app="Snapchat" minutes={todayStats.snapchatMinutes} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Usage is tracked automatically every 5 minutes.
          </Text>
          <Text style={styles.infoText}>
            Data is synced to the cloud and aggregated weekly/monthly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{ app: string; minutes: number }> = ({ app, minutes }) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return (
    <View style={styles.statCard}>
      <Text style={styles.statApp}>{app}</Text>
      <Text style={styles.statTime}>
        {hours > 0 ? `${hours}h ` : ''}
        {mins}m
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statApp: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  statTime: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
});

