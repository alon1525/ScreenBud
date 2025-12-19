import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface LevelBadgeProps {
  level: number;
  xp: number;
  xpForNextLevel: number;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  xp,
  xpForNextLevel,
}) => {
  const progress = xpForNextLevel > 0 ? ((xpForNextLevel - xp) / xpForNextLevel) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>Level</Text>
        <Text style={styles.levelNumber}>{level}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${100 - progress}%` },
            ]}
          />
        </View>
        <Text style={styles.xpText}>
          {xpForNextLevel - xp} XP to next level
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 12,
  },
  levelContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  levelLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});


