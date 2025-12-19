import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getUsageStatusColor } from '../../constants/colors';

interface SimpleProgressRingProps {
  progress: number; // 0-100
  size?: number;
  current: number; // minutes
  goal: number; // minutes
  points?: number;
}

export const SimpleProgressRing: React.FC<SimpleProgressRingProps> = ({
  progress,
  size = 200,
  current,
  goal,
  points = 0,
}) => {
  const color = getUsageStatusColor(progress);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const strokeWidth = 12;
  const innerSize = size - strokeWidth * 2;

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        {/* Background circle */}
        <View
          style={[
            styles.ringBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
            },
          ]}
        />
        {/* Progress arc - using a simple approach */}
        <View
          style={[
            styles.progressArc,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              borderWidth: strokeWidth,
              borderColor: color,
            },
          ]}
        />
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.timeText}>{formatTime(current)}</Text>
          <Text style={styles.goalText}>/ {formatTime(goal)}</Text>
          {points > 0 && (
            <Text style={styles.pointsText}>{points} pts</Text>
          )}
          <Text style={[styles.percentageText, { color }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringBackground: {
    position: 'absolute',
    borderColor: Colors.lightGray,
    backgroundColor: 'transparent',
  },
  progressArc: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  goalText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 8,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
