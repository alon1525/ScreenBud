import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ScreenTimeBattle</Text>
      <Text style={styles.subtext}>App is working! 🎉</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#636E72',
  },
});


