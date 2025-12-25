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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeModules } from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { socialMediaTrackingService, DailyStats, getTodayDateString, WeeklyStats, getWeekId, getWeekDates } from '../services/socialMediaTracking';
import { CircularProgress } from '../components/common/CircularProgress';
import { GoalEditorModal } from '../components/common/GoalEditorModal';
import { userService } from '../services/firestore';

const { UsageStatsModule } = NativeModules;

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
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedWeekId, setSelectedWeekId] = useState<string>(getWeekId());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
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
  
  // Tab bar base height is 60px, add safe area bottom inset
  const bottomPadding = 60 + insets.bottom + 16;

  useEffect(() => {
    loadData();
    loadAvailableDates();
    loadAvailableWeeks();
  }, [user?.uid]);

  useEffect(() => {
    if (viewMode === 'daily') {
      loadDailyStats(selectedDate);
    } else {
      loadWeeklyStats(selectedWeekId);
    }
  }, [viewMode, selectedDate, selectedWeekId, user?.uid]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (viewMode === 'daily' && selectedDate === getTodayDateString()) {
        await Promise.all([loadAndSaveTodayStats(), loadGoals()]);
      } else if (viewMode === 'daily') {
        await Promise.all([loadDailyStats(selectedDate), loadGoals()]);
      } else {
        await Promise.all([loadWeeklyStats(selectedWeekId), loadGoals()]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAvailableDates = async () => {
    if (!user) return;
    
    try {
      // Get dates for last 30 days
      const dates: string[] = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dates.push(dateString);
      }
      
      // Check which dates have data
      const availableDatesList: string[] = [];
      for (const date of dates) {
        try {
          const stats = await socialMediaTrackingService.getDailyStats(user.uid, date);
          if (stats) {
            availableDatesList.push(date);
          }
        } catch (error) {
          // Date doesn't have data, skip it
        }
      }
      
      // Always include today even if no data yet
      const todayString = getTodayDateString();
      if (!availableDatesList.includes(todayString)) {
        availableDatesList.unshift(todayString);
      }
      
      setAvailableDates(availableDatesList);
    } catch (error) {
      console.error('Error loading available dates:', error);
      // Fallback to just today
      setAvailableDates([getTodayDateString()]);
    }
  };

  const loadDailyStats = async (date: string) => {
    if (!user) return;
    
    try {
      const dailyStats = await socialMediaTrackingService.getDailyStats(user.uid, date);
      setStats(dailyStats);
    } catch (error) {
      console.error('Error loading daily stats:', error);
      setStats(null);
    }
  };

  const loadWeeklyStats = async (weekId: string) => {
    if (!user) return;
    
    try {
      const weekly = await socialMediaTrackingService.getWeeklyStats(user.uid, weekId);
      setWeeklyStats(weekly);
    } catch (error) {
      console.error('Error loading weekly stats:', error);
      setWeeklyStats(null);
    }
  };

  const loadAvailableWeeks = async () => {
    if (!user) return;
    
    try {
      // Get weeks for last 12 weeks
      const weeks: string[] = [];
      const today = new Date();
      
      for (let i = 0; i < 12; i++) {
        const weekDate = new Date(today);
        weekDate.setDate(today.getDate() - (i * 7));
        const weekId = getWeekId(weekDate);
        if (!weeks.includes(weekId)) {
          weeks.push(weekId);
        }
      }
      
      // Always include current week
      const currentWeekId = getWeekId();
      if (!weeks.includes(currentWeekId)) {
        weeks.unshift(currentWeekId);
      }
      
      // For now, show all weeks (they will aggregate from daily stats if needed)
      // We can filter later if needed, but showing all weeks allows users to see any week
      setAvailableWeeks(weeks);
    } catch (error) {
      console.error('Error loading available weeks:', error);
      // Fallback to just current week
      setAvailableWeeks([getWeekId()]);
    }
  };

  const loadAndSaveTodayStats = async () => {
    if (!user || !UsageStatsModule) return;
    
    try {
      // 0. Check timezone (for debugging)
      const timezoneInfo = await UsageStatsModule.getDeviceTimezone();
      console.log('=== Device Timezone Info ===');
      console.log('Timezone ID:', timezoneInfo.id);
      console.log('Display Name:', timezoneInfo.displayName);
      console.log('Raw Offset (minutes):', timezoneInfo.rawOffset);
      console.log('DST Savings (minutes):', timezoneInfo.dstSavings);
      console.log('Uses Daylight Time:', timezoneInfo.useDaylightTime);
      
      // 1. Check permission
      const hasPermission = await UsageStatsModule.hasUsageStatsPermission();
      if (!hasPermission) {
        console.log('No usage stats permission');
        setStats(null);
        return;
      }

      // 2. Get data from native module (phone)
      const nativeStats = await UsageStatsModule.getTodayUsageStats();
      if (!nativeStats) {
        console.log('No stats from native module');
        setStats(null);
        return;
      }

      console.log('=== Dashboard: Got stats from native module ===');
      console.log('Raw stats:', nativeStats);
      console.log('Raw stats keys:', Object.keys(nativeStats));
      console.log('Raw stats values:', Object.values(nativeStats));

      // 3. Map and convert to DailyStats format
      // Native module returns keys like "instagramMinutes", "facebookMinutes", "instagramEntrances", etc.
      const dailyStats: DailyStats = {
        tiktokMinutes: 0,
        instagramMinutes: 0,
        youtubeMinutes: 0,
        facebookMinutes: 0,
        snapchatMinutes: 0,
        tiktokEntrances: 0,
        instagramEntrances: 0,
        youtubeEntrances: 0,
        facebookEntrances: 0,
        snapchatEntrances: 0,
        updatedAt: new Date(),
      };

      // Direct mapping - native module keys should match DailyStats field names
      for (const [key, value] of Object.entries(nativeStats)) {
        // Check if the key is a valid field in DailyStats
        if (key in dailyStats && typeof value === 'number') {
          const fieldName = key as keyof DailyStats;
          // Ensure we're setting a number field, not updatedAt
          if (fieldName !== 'updatedAt') {
            (dailyStats[fieldName] as number) = Math.round(value);
            if (key.endsWith('Minutes')) {
              console.log(`Mapped ${key}: ${value} -> ${Math.round(value)} minutes`);
            } else if (key.endsWith('Entrances')) {
              console.log(`Mapped ${key}: ${value} -> ${Math.round(value)} entrances`);
            }
          }
        } else {
          console.warn(`Unknown or invalid key from native module: ${key} = ${value}`);
        }
      }

      console.log('Mapped stats:', dailyStats);

      // 4. Save to database
      const today = getTodayDateString();
      await socialMediaTrackingService.setDailyStats(user.uid, today, dailyStats);
      console.log('✅ Saved to database');

      // 5. Display the data we just pulled (not from database)
      setStats(dailyStats);
    } catch (error: any) {
      console.error('Error loading/saving stats:', error);
      if (error?.code !== 'PERMISSION_DENIED') {
        setStats(null);
      }
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
    if (viewMode === 'weekly' && weeklyStats) {
      return weeklyStats.totalMinutes || 0;
    }
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            if (viewMode === 'daily' && selectedDate === getTodayDateString()) {
              await loadAndSaveTodayStats();
            } else if (viewMode === 'daily') {
              await loadDailyStats(selectedDate);
            } else {
              await loadWeeklyStats(selectedWeekId);
            }
            setRefreshing(false);
          }} />
        }
      >
        {/* Header with View Mode Toggle */}
        <View style={styles.header}>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'daily' && styles.toggleButtonActive]}
              onPress={() => setViewMode('daily')}
            >
              <Text style={[styles.toggleText, viewMode === 'daily' && styles.toggleTextActive]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'weekly' && styles.toggleButtonActive]}
              onPress={() => setViewMode('weekly')}
            >
              <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Day Selector (only for daily view) */}
          {viewMode === 'daily' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.daySelector}
              contentContainerStyle={styles.daySelectorContent}
            >
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const isToday = date === getTodayDateString();
                const isSelected = date === selectedDate;
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = dateObj.getDate();
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonSelected,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                      {isToday ? 'Today' : dayName}
                    </Text>
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                      {dayNumber}
                    </Text>
                    {!isToday && (
                      <Text style={[styles.dayMonth, isSelected && styles.dayMonthSelected]}>
                        {month}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Week Selector (only for weekly view) */}
          {viewMode === 'weekly' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.daySelector}
              contentContainerStyle={styles.daySelectorContent}
            >
              {availableWeeks.map((weekId) => {
                const { start, end } = getWeekDates(weekId);
                const isCurrentWeek = weekId === getWeekId();
                const isSelected = weekId === selectedWeekId;
                const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
                const startDay = start.getDate();
                const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
                const endDay = end.getDate();

                return (
                  <TouchableOpacity
                    key={weekId}
                    style={[
                      styles.weekButton,
                      isSelected && styles.weekButtonSelected,
                    ]}
                    onPress={() => setSelectedWeekId(weekId)}
                  >
                    <Text style={[styles.weekLabel, isSelected && styles.weekLabelSelected]}>
                      {isCurrentWeek ? 'This Week' : 'Week'}
                    </Text>
                    <Text style={[styles.weekDate, isSelected && styles.weekDateSelected]}>
                      {startMonth} {startDay} - {endMonth} {endDay}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
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

        {/* App Cards - Full Width Sections */}
        <View style={styles.appsContainer}>
          {APPS.map((app) => {
            let used = 0;
            let entranceCount = 0;

            if (viewMode === 'weekly' && weeklyStats) {
              // For weekly, get from weeklyStats
              const weekKey = `${app.goalKey}Minutes` as keyof WeeklyStats;
              used = (weeklyStats[weekKey] as number) || 0;
              // Weekly doesn't have entrance counts, so we'll show 0 or calculate differently
              entranceCount = 0;
            } else {
              // For daily, get from stats
              const usedMinutes = stats?.[app.key];
              used = typeof usedMinutes === 'number' ? usedMinutes : 0;
              const entranceKey = `${app.goalKey}Entrances` as keyof DailyStats;
              const entrances = stats?.[entranceKey];
              entranceCount = typeof entrances === 'number' ? entrances : 0;
            }

            const goal = goals[app.goalKey as keyof AppGoals];
            // For weekly, multiply goal by 7
            const adjustedGoal = viewMode === 'weekly' ? goal * 7 : goal;
            const percentage = getProgress(used, adjustedGoal);
            
            // Calculate average session time
            const avgSessionTime = entranceCount > 0 ? Math.round(used / entranceCount) : 0;
            
            // Calculate time remaining or over
            const remaining = adjustedGoal - used;
            const isOverGoal = used > adjustedGoal;

            return (
              <TouchableOpacity
                key={app.key}
                style={[styles.appCard, { borderLeftColor: app.color }]}
                onPress={() => handleAppPress(app)}
                activeOpacity={0.8}
              >
                {/* App Header */}
                <View style={styles.appHeader}>
                  <View style={styles.appTitleRow}>
                    <Text style={styles.appIcon}>{app.icon}</Text>
                    <View style={styles.appTitleContainer}>
                      <Text style={styles.appName}>{app.name}</Text>
                      <Text style={styles.appSubtitle}>
                        {viewMode === 'weekly' 
                          ? 'Weekly usage' 
                          : `${entranceCount} ${entranceCount === 1 ? 'session' : 'sessions'}`
                        }
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.progressBadge, { backgroundColor: app.color + '20' }]}>
                    <Text style={[styles.progressBadgeText, { color: app.color }]}>
                      {Math.round(percentage)}%
                    </Text>
                  </View>
                </View>

                {/* Main Stats Row */}
                <View style={styles.mainStatsRow}>
                  {/* Circular Progress */}
                  <View style={styles.progressContainer}>
                    <CircularProgress
                      progress={percentage}
                      size={100}
                      strokeWidth={10}
                      color={app.color}
                      used={used}
                      goal={adjustedGoal}
                      appName=""
                      appIcon=""
                    />
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Time Used</Text>
                      <Text style={[styles.statValue, { color: app.color }]}>
                        {formatMinutes(used)}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Goal</Text>
                      <Text style={styles.statValue}>{formatMinutes(adjustedGoal)}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Avg Session</Text>
                      <Text style={styles.statValue}>
                        {avgSessionTime > 0 ? formatMinutes(avgSessionTime) : '—'}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>
                        {isOverGoal ? 'Over by' : 'Remaining'}
                      </Text>
                      <Text style={[styles.statValue, isOverGoal && { color: '#FF4444' }]}>
                        {formatMinutes(Math.abs(remaining))}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarBackground, { backgroundColor: app.color + '15' }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: app.color,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Edit Hint */}
                <View style={styles.editHintContainer}>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  daySelector: {
    maxHeight: 80,
  },
  daySelectorContent: {
    paddingRight: 16,
  },
  dayButton: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayButtonDisabled: {
    opacity: 0.4,
    backgroundColor: Colors.background,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dayNameSelected: {
    color: Colors.white,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  dayNumberSelected: {
    color: Colors.white,
  },
  dayMonth: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dayMonthSelected: {
    color: Colors.white,
  },
  weekButton: {
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  weekLabelSelected: {
    color: Colors.white,
  },
  weekDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  weekDateSelected: {
    color: Colors.white,
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
  appsContainer: {
    gap: 16,
  },
  appCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  appTitleContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  mainStatsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '47%',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  editHintContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  editHintText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
