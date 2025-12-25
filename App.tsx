/**
 * ScreenTimeBattle - Gamified Screen Time Tracker
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { MainNavigator } from './src/navigation/MainNavigator';
import { UsernameSetup } from './src/screens/UsernameSetup';
import { UsagePermissionScreen } from './src/screens/UsagePermissionScreen';
import { Colors } from './src/constants/colors';
import { useSocialMediaTracking } from './src/hooks/useSocialMediaTracking';
import { useUsagePermission } from './src/hooks/useUsagePermission';
import { socialMediaTrackingService } from './src/services/socialMediaTracking';

function AppContent() {
  const { user, loading, hasUsername, usernameLoading } = useAuth();
  const { hasPermission, checking: permissionChecking } = useUsagePermission();
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // Only start tracking if user has username and permission
  // Hook handles conditional logic internally
  useSocialMediaTracking();

  // Handle deep links for automatic friend adding
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (!user) return;

      try {
        // Check if it's a friend link: screentimebattle://add-friend/{userId}
        if (url.includes('add-friend/')) {
          await socialMediaTrackingService.addFriendByLink(user.uid, url);
          Alert.alert('Success', 'Friend added successfully!');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to add friend');
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URLs when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Show loading screen while checking auth or permission
  if (loading || usernameLoading || (user && hasUsername && permissionChecking && !permissionGranted)) {
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

  // If user has username but no permission, show permission screen
  if (user && hasUsername && !hasPermission && !permissionGranted) {
    return (
      <UsagePermissionScreen
        onPermissionGranted={() => {
          setPermissionGranted(true);
        }}
      />
    );
  }

  // Otherwise show main navigation with bottom tabs (user has username and permission)
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
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
