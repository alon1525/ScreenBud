import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { socialMediaTrackingService, DailyStats } from '../services/socialMediaTracking';
import { CircularProgress } from '../components/common/CircularProgress';
import { GoalEditorModal } from '../components/common/GoalEditorModal';
import { userService } from '../services/firestore';

interface AppData {
  name: string;
  key: keyof DailyStats;
  color: string;
  icon: string;
  goalKey: string;
}

const APPS: AppData[] = [
  { name: 'YouTube', key: 'youtubeMinutes', color: '#FF0000', icon: '▶', goalKey: 'youtube' },
  { name: 'Instagram', key: 'instagramMinutes', color: '#E4405F', icon: '📷', goalKey: 'instagram' },
  { name: 'TikTok', key: 'tiktokMinutes', color: '#8B5CF6', icon: '🎵', goalKey: 'tiktok' },
  { name: 'Snapchat', key: 'snapchatMinutes', color: '#FFFC00', icon: '👻', goalKey: 'snapchat' },
  { name: 'Facebook', key: 'facebookMinutes', color: '#1877F2', icon: '👥', goalKey: 'facebook' },
];

const DEFAULT_GOAL_MINUTES = 60; // 1 hour

interface AppGoals {
  youtube: number;
  instagram: number;
  tiktok: number;
  snapchat: number;
  facebook: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [goals, setGoals] = useState<AppGoals>({
    youtube: DEFAULT_GOAL_MINUTES,
    instagram: DEFAULT_GOAL_MINUTES,
    tiktok: DEFAULT_GOAL_MINUTES,
    snapchat: DEFAULT_GOAL_MINUTES,
    facebook: DEFAULT_GOAL_MINUTES,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      await Promise.all([loadTodayStats(), loadGoals()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTodayStats = async () => {
    if (!user) return;
    try {
      const todayStats = await socialMediaTrackingService.getTodayStats(user.uid);
      setStats(todayStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadGoals = async () => {
    if (!user) return;
    try {
      const userDoc = await userService.getUser(user.uid);
      if (userDoc && (userDoc as any).appGoals) {
        setGoals({
          youtube: (userDoc as any).appGoals.youtube || DEFAULT_GOAL_MINUTES,
          instagram: (userDoc as any).appGoals.instagram || DEFAULT_GOAL_MINUTES,
          tiktok: (userDoc as any).appGoals.tiktok || DEFAULT_GOAL_MINUTES,
          snapchat: (userDoc as any).appGoals.snapchat || DEFAULT_GOAL_MINUTES,
          facebook: (userDoc as any).appGoals.facebook || DEFAULT_GOAL_MINUTES,
        });
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoal = async (appKey: string, goal: number) => {
    if (!user) return;
    try {
      const updatedGoals = { ...goals, [appKey]: goal };
      setGoals(updatedGoals);
      await userService.updateUser(user.uid, {
        appGoals: updatedGoals,
      } as any);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleAppPress = (app: AppData) => {
    setSelectedApp(app);
    setGoalModalVisible(true);
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getProgress = (used: number, goal: number): number => {
    return (used / goal) * 100; // Can be over 100
  };

  const getTotalUsed = (): number => {
    return (
      (typeof stats?.tiktokMinutes === 'number' ? stats.tiktokMinutes : 0) +
      (typeof stats?.instagramMinutes === 'number' ? stats.instagramMinutes : 0) +
      (typeof stats?.youtubeMinutes === 'number' ? stats.youtubeMinutes : 0) +
      (typeof stats?.facebookMinutes === 'number' ? stats.facebookMinutes : 0) +
      (typeof stats?.snapchatMinutes === 'number' ? stats.snapchatMinutes : 0)
    );
  };

  const getTotalGoal = (): number => {
    return Object.values(goals).reduce((sum, goal) => sum + goal, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalUsed = getTotalUsed();
  const totalGoal = getTotalGoal();
  const totalPercentage = getProgress(totalUsed, totalGoal);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadData();
          }} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Today's Usage</Text>
          <Text style={styles.subtitle}>Track your social media time</Text>
        </View>

        {/* Total Progress Card */}
        <View style={styles.totalCard}>
          <CircularProgress
            progress={totalPercentage}
            size={180}
            strokeWidth={16}
            color={Colors.primary}
            used={totalUsed}
            goal={totalGoal}
            appName="Total"
            appIcon="📊"
          />
        </View>

        {/* App Cards Grid */}
        <View style={styles.appsGrid}>
          {APPS.map((app) => {
            const usedMinutes = stats?.[app.key];
            const used = typeof usedMinutes === 'number' ? usedMinutes : 0;
            const goal = goals[app.goalKey as keyof AppGoals];
            const percentage = getProgress(used, goal);

            return (
              <TouchableOpacity
                key={app.key}
                style={[styles.appCard, { borderColor: app.color + '30' }]}
                onPress={() => handleAppPress(app)}
                activeOpacity={0.7}
              >
                <CircularProgress
                  progress={percentage}
                  size={140}
                  strokeWidth={12}
                  color={app.color}
                  used={used}
                  goal={goal}
                  appName={app.name}
                  appIcon={app.icon}
                />
                <View style={styles.editHint}>
                  <Text style={[styles.editHintText, { color: app.color }]}>
                    Tap to edit goal
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Goal Editor Modal */}
      {selectedApp && (
        <GoalEditorModal
          visible={goalModalVisible}
          appName={selectedApp.name}
          appIcon={selectedApp.icon}
          appColor={selectedApp.color}
          currentGoal={goals[selectedApp.goalKey as keyof AppGoals]}
          onClose={() => {
            setGoalModalVisible(false);
            setSelectedApp(null);
          }}
          onSave={(goal) => saveGoal(selectedApp.goalKey, goal)}
        />
      )}
    </SafeAreaView>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  totalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  appCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  editHint: {
    marginTop: 8,
  },
  editHintText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
