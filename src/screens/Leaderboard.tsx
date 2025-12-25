import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/firestore';
import { socialMediaTrackingService, DailyStats, getTodayDateString } from '../services/socialMediaTracking';
import { AddFriendsModal } from '../components/AddFriendsModal';

interface LeaderboardEntry {
  uid: string;
  username: string;
  nickname?: string;
  minutes: number;
  isCurrentUser?: boolean;
}

type LeaderboardTab = 'overall' | 'youtube' | 'instagram' | 'tiktok' | 'snapchat' | 'facebook';

const TAB_CONFIG: { key: LeaderboardTab; label: string; icon: string; color: string }[] = [
  { key: 'overall', label: 'Overall', icon: '📊', color: Colors.primary },
  { key: 'youtube', label: 'YouTube', icon: '▶', color: '#FF0000' },
  { key: 'instagram', label: 'Instagram', icon: '📷', color: '#E4405F' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵', color: '#8B5CF6' },
  { key: 'snapchat', label: 'Snapchat', icon: '👻', color: '#FFFC00' },
  { key: 'facebook', label: 'Facebook', icon: '👥', color: '#1877F2' },
];

const APP_KEY_MAP: Record<LeaderboardTab, keyof DailyStats | 'total'> = {
  overall: 'total',
  youtube: 'youtubeMinutes',
  instagram: 'instagramMinutes',
  tiktok: 'tiktokMinutes',
  snapchat: 'snapchatMinutes',
  facebook: 'facebookMinutes',
};

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('overall');
  const [leaderboards, setLeaderboards] = useState<Record<LeaderboardTab, LeaderboardEntry[]>>({
    overall: [],
    youtube: [],
    instagram: [],
    tiktok: [],
    snapchat: [],
    facebook: [],
  });
  const [userStats, setUserStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRanks, setUserRanks] = useState<Record<LeaderboardTab, number | null>>({
    overall: null,
    youtube: null,
    instagram: null,
    tiktok: null,
    snapchat: null,
    facebook: null,
  });
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const swipeScrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  
  // Tab bar base height is 60px, add safe area bottom inset
  const bottomPadding = 60 + insets.bottom + 16;

  const loadData = async (tab?: LeaderboardTab) => {
    if (!user) {
      setLoading(false);
      return;
    }

    const tabToLoad = tab || activeTab;

    try {
      setRefreshing(true);
      fadeAnim.setValue(0);
      
      // Load user's today stats
      const today = getTodayDateString();
      const stats = await socialMediaTrackingService.getDailyStats(user.uid, today);
      setUserStats(stats);

      // Load real leaderboard data from Firestore
      const leaderboardData = await socialMediaTrackingService.getLeaderboard(
        user.uid,
        tabToLoad,
        today
      );

      // Convert to LeaderboardEntry format and mark current user
      const entries: LeaderboardEntry[] = leaderboardData.map((entry) => ({
        uid: entry.uid,
        username: entry.nickname || entry.username,
        minutes: entry.minutes,
        isCurrentUser: entry.uid === user.uid,
      }));

      // Find user's rank
      const rank = entries.findIndex(u => u.isCurrentUser) + 1;
      const userRankValue = rank > 0 ? rank : null;
      
      // Update leaderboards and ranks for this tab
      setLeaderboards(prev => ({ ...prev, [tabToLoad]: entries }));
      setUserRanks(prev => ({ ...prev, [tabToLoad]: userRankValue }));
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
      setError(error?.message || 'Failed to load leaderboard');
      // On error, show empty state
      setLeaderboards(prev => ({ ...prev, [tabToLoad]: [] }));
      setUserRanks(prev => ({ ...prev, [tabToLoad]: null }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load all tabs data on mount
  const loadAllTabsData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const today = getTodayDateString();
      const stats = await socialMediaTrackingService.getDailyStats(user.uid, today);
      setUserStats(stats);

      // Load data for all tabs in parallel
      const loadPromises = TAB_CONFIG.map(async (tab) => {
        try {
          const leaderboardData = await socialMediaTrackingService.getLeaderboard(
            user.uid,
            tab.key,
            today
          );

          const entries: LeaderboardEntry[] = leaderboardData.map((entry) => ({
            uid: entry.uid,
            username: entry.nickname || entry.username,
            minutes: entry.minutes,
            isCurrentUser: entry.uid === user.uid,
          }));

          const rank = entries.findIndex(u => u.isCurrentUser) + 1;
          const userRankValue = rank > 0 ? rank : null;

          return { tab: tab.key, entries, rank: userRankValue };
        } catch (error) {
          console.error(`Error loading ${tab.key} leaderboard:`, error);
          return { tab: tab.key, entries: [], rank: null };
        }
      });

      const results = await Promise.all(loadPromises);
      
      const newLeaderboards: Record<LeaderboardTab, LeaderboardEntry[]> = {
        overall: [],
        youtube: [],
        instagram: [],
        tiktok: [],
        snapchat: [],
        facebook: [],
      };
      const newRanks: Record<LeaderboardTab, number | null> = {
        overall: null,
        youtube: null,
        instagram: null,
        tiktok: null,
        snapchat: null,
        facebook: null,
      };

      results.forEach(({ tab, entries, rank }) => {
        newLeaderboards[tab as LeaderboardTab] = entries;
        newRanks[tab as LeaderboardTab] = rank;
      });

      setLeaderboards(newLeaderboards);
      setUserRanks(newRanks);
    } catch (error: any) {
      console.error('Error loading all tabs data:', error);
      setError(error?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllTabsData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    // Fade in animation when data loads
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [leaderboards, fadeAnim]);

  // Sync scroll position when tab changes
  useEffect(() => {
    const tabIndex = TAB_CONFIG.findIndex(t => t.key === activeTab);
    if (tabIndex >= 0 && swipeScrollViewRef.current) {
      swipeScrollViewRef.current.scrollTo({
        x: tabIndex * screenWidth,
        animated: true,
      });
    }
  }, [activeTab, screenWidth]);

  // Load data for a tab when it becomes active via swipe
  const handleTabChange = (newTab: LeaderboardTab) => {
    setActiveTab(newTab);
    // Reload data if this tab's data is empty
    if (leaderboards[newTab].length === 0) {
      loadData(newTab);
    }
  };

  const getMedal = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };


  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 16, color: Colors.textSecondary }}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tabConfig = TAB_CONFIG.find(t => t.key === activeTab) || TAB_CONFIG[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Add Friends Button and Friends List */}
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.friendsListButton}
            onPress={() => navigation.navigate('FriendsList')}
            activeOpacity={0.7}
          >
            <Text style={styles.friendsListButtonText}>👥 Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addFriendsButton}
            onPress={() => setShowAddFriendsModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addFriendsButtonText}>+ Add Friends</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {TAB_CONFIG.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && [
                styles.tabActive,
                { backgroundColor: tab.color, borderColor: tab.color },
              ],
            ]}
            onPress={() => {
              setActiveTab(tab.key);
              // Load data if needed
              if (leaderboards[tab.key].length === 0) {
                loadData(tab.key);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && { color: Colors.white, fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Swipeable Content */}
      <ScrollView
        ref={swipeScrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const pageIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          if (pageIndex >= 0 && pageIndex < TAB_CONFIG.length) {
            handleTabChange(TAB_CONFIG[pageIndex].key);
          }
        }}
        scrollEventThrottle={16}
        style={styles.swipeContainer}
      >
        {TAB_CONFIG.map((tab) => {
          const tabLeaderboard = leaderboards[tab.key];
          const tabMaxMinutes = tabLeaderboard.length > 0 
            ? Math.max(...tabLeaderboard.map(u => u.minutes), 100) 
            : 100;
          const tabUserRankValue = userRanks[tab.key];

          return (
            <View key={tab.key} style={[styles.tabPage, { width: screenWidth }]}>
              {/* User Rank Card */}
              {tabUserRankValue !== null && (
                <View style={[styles.userRankCard, { borderColor: tab.color }]}>
                  <View style={styles.userRankHeader}>
                    <View>
                      <Text style={styles.userRankLabel}>Your Rank</Text>
                      <Text style={[styles.userRankNumber, { color: tab.color }]}>
                        #{tabUserRankValue}
                      </Text>
                    </View>
                    <View style={[styles.userRankBadge, { backgroundColor: tab.color + '20' }]}>
                      <Text style={[styles.userRankBadgeText, { color: tab.color }]}>
                        {getMedal(tabUserRankValue) || `Top ${Math.round((tabLeaderboard.length - tabUserRankValue + 1) / tabLeaderboard.length * 100)}%`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.userRankStats}>
                    <Text style={styles.userRankTime}>
                      {formatMinutes(tabLeaderboard.find(u => u.isCurrentUser)?.minutes || 0)}
                    </Text>
                    <Text style={styles.userRankSubtext}>
                      {tab.key === 'overall' ? 'Total time today' : `${tab.label} time`}
                    </Text>
                  </View>
                </View>
              )}

              {/* Leaderboard List */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => loadAllTabsData()} />
                }
              >
                {error ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Error loading leaderboard</Text>
                    <Text style={styles.emptySubtext}>{error}</Text>
                  </View>
                ) : tabLeaderboard.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No data yet</Text>
                    <Text style={styles.emptySubtext}>
                      Start using apps to see your ranking!
                    </Text>
                  </View>
                ) : (
                  <Animated.View style={{ opacity: fadeAnim }}>
                    {tabLeaderboard.map((entry, index) => {
                      const rank = index + 1;
                      const progress = tabMaxMinutes > 0 ? (entry.minutes / tabMaxMinutes) * 100 : 0;
                      const isTopThree = rank <= 3;
                      const isUser = entry.isCurrentUser;

                      return (
                        <Animated.View
                          key={entry.uid}
                          style={[
                            styles.rankCard,
                            isUser && [styles.rankCardUser, { borderColor: tab.color }],
                            isTopThree && styles.rankCardTop,
                          ]}
                        >
                          {/* Rank Badge */}
                          <View style={[styles.rankBadge, isTopThree && styles.rankBadgeTop]}>
                            {isTopThree ? (
                              <Text style={styles.medal}>{getMedal(rank)}</Text>
                            ) : (
                              <Text style={[styles.rankNumber, isUser && { color: tab.color }]}>
                                {rank}
                              </Text>
                            )}
                          </View>

                          {/* User Info */}
                          <View style={styles.userInfo}>
                            <View style={styles.userNameRow}>
                              <Text style={[styles.userName, isUser && { fontWeight: '700' }]}>
                                {entry.username}
                                {isUser && ' (You)'}
                              </Text>
                              <Text style={[styles.userTime, isUser && { color: tab.color, fontWeight: '700' }]}>
                                {formatMinutes(entry.minutes)}
                              </Text>
                            </View>
                            
                            {/* Progress Bar */}
                            <View style={[styles.progressBarContainer, { backgroundColor: tab.color + '15' }]}>
                              <Animated.View
                                style={[
                                  styles.progressBarFill,
                                  {
                                    width: `${progress}%`,
                                    backgroundColor: isUser ? tab.color : tab.color + '60',
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </Animated.View>
                      );
                    })}
                  </Animated.View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Friends Modal */}
      <AddFriendsModal
        visible={showAddFriendsModal}
        onClose={() => setShowAddFriendsModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  friendsListButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendsListButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  addFriendsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addFriendsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    maxHeight: 60,
    marginTop: 8,
    marginBottom: 20,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabActive: {
    borderWidth: 2,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  userRankCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  userRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userRankLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  userRankNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  userRankBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  userRankBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userRankStats: {
    alignItems: 'center',
  },
  userRankTime: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userRankSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  swipeContainer: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  rankCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  rankCardUser: {
    borderWidth: 2,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  rankCardTop: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  rankBadgeTop: {
    backgroundColor: '#FFD70020',
  },
  medal: {
    fontSize: 28,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  userTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  progressBarContainer: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
