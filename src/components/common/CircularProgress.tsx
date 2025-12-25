import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface CircularProgressProps {
  progress: number; // 0-100 (can be over 100)
  size?: number;
  strokeWidth?: number;
  color: string;
  used: number;
  goal: number;
  appName: string;
  appIcon: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color,
  used,
  goal,
  appName,
  appIcon,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Cap progress at 100% for the circle, but show actual percentage in text
  const normalizedProgress = Math.min(progress, 100);
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const displayPercentage = Math.round(progress);

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
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
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.icon}>{appIcon}</Text>
          <Text style={[styles.percentage, { color }]}>{displayPercentage}%</Text>
          <Text style={styles.time}>{formatMinutes(used)}</Text>
        </View>
      </View>
      <Text style={styles.appName}>{appName}</Text>
      <Text style={styles.goal}>Goal: {formatMinutes(goal)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  percentage: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  goal: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});


