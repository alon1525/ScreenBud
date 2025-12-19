import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, getUsageStatusColor } from '../../constants/colors';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  current: number; // minutes
  goal: number; // minutes
  points?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 200,
  strokeWidth = 12,
  current,
  goal,
  points = 0,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = getUsageStatusColor(progress);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.lightGray}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.timeText}>{formatTime(current)}</Text>
        <Text style={styles.goalText}>/ {formatTime(goal)}</Text>
        {points > 0 && (
          <Text style={styles.pointsText}>{points} pts</Text>
        )}
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.textSecondary,
    marginTop: 4,
  },
});


