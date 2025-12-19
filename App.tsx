/**
 * ScreenTimeBattle - Gamified Screen Time Tracker
 * @format
 */

import React from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { Dashboard } from './src/screens/Dashboard';
import { UsernameSetup } from './src/screens/UsernameSetup';
import { Colors } from './src/constants/colors';

function AppContent() {
  const { user, loading, hasUsername, usernameLoading } = useAuth();

  // Show loading screen while checking auth
  if (loading || usernameLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If user doesn't have username, show setup screen
  if (user && !hasUsername) {
    return <UsernameSetup />;
  }

  // Otherwise show dashboard
  return <Dashboard />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
