import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common/Card';
import { SimpleProgressRing } from '../components/gamification/SimpleProgressRing';
import { StreakIndicator } from '../components/gamification/StreakIndicator';
import { LevelBadge } from '../components/gamification/LevelBadge';
import { Colors } from '../constants/colors';
import { calculateDailyPoints, xpForNextLevel } from '../constants/points';

export const Dashboard: React.FC = () => {
  // Mock data for now - will be replaced with real data later
  const goalMinutes = 120; // 2 hours
  const currentMinutes = 45; // 45 minutes used
  const progress = (currentMinutes / goalMinutes) * 100;
  const streak = 7;
  const level = 5;
  const totalXP = 4500;
  const xpForNext = xpForNextLevel(level, totalXP % 1000);
  const points = calculateDailyPoints(goalMinutes, currentMinutes, streak);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.username}>Player</Text>
          </View>
          <StreakIndicator streak={streak} size="medium" />
        </View>

        {/* Level Badge */}
        <LevelBadge
          level={level}
          xp={totalXP % 1000}
          xpForNextLevel={xpForNext}
        />

        {/* Today's Progress Card */}
        <Card>
          <Text style={styles.cardTitle}>Today's Progress</Text>
          <View style={styles.progressContainer}>
            <SimpleProgressRing
              progress={progress}
              current={currentMinutes}
              goal={goalMinutes}
              points={points}
            />
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: Colors.success }]}>
              You're crushing it! 🎉
            </Text>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Weekly Total</Text>
            <Text style={styles.statValue}>8h 45m</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>League Rank</Text>
            <Text style={styles.statValue}>#12 / 45</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Points</Text>
            <Text style={styles.statValue}>{points}</Text>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonMargin]}
            onPress={() => Alert.alert('View Details', 'This will show detailed stats!')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => Alert.alert('Leaderboard', 'This will show the weekly leaderboard!')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonTextSecondary}>
              Weekly Leaderboard
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 32, // Extra padding at bottom for safe area
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statusContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionButtonMargin: {
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 14, // Slightly less padding to account for border
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

