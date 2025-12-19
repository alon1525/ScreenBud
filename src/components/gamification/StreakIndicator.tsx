import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface StreakIndicatorProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  streak,
  size = 'medium',
}) => {
  const sizeStyles = {
    small: { fontSize: 14, iconSize: 16 },
    medium: { fontSize: 18, iconSize: 20 },
    large: { fontSize: 24, iconSize: 28 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { fontSize: currentSize.iconSize }]}>🔥</Text>
      <Text style={[styles.streakText, { fontSize: currentSize.fontSize }]}>
        {streak} day{streak !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  icon: {
    marginRight: 6,
  },
  streakText: {
    fontWeight: '600',
    color: Colors.text,
  },
});


