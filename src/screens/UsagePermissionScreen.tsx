/**
 * Usage Permission Screen
 * Shown when user needs to grant usage stats permission
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  NativeModules,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

const { UsageStatsModule } = NativeModules;

type DeviceType = 'samsung' | 'xiaomi' | 'huawei' | 'pixel';

interface DeviceInstructions {
  name: string;
  steps: string[];
}

interface UsagePermissionScreenProps {
  onPermissionGranted: () => void;
}

const DEVICE_INSTRUCTIONS: Record<DeviceType, DeviceInstructions> = {
  samsung: {
    name: 'Samsung (Galaxy S series, Note, etc.)',
    steps: [
      'Open Settings',
      'Go to Apps',
      'Tap the three dots or "Special Access"',
      'Select "Usage Access"',
      'Scroll to find "ScreenTimeBattle"',
      'Toggle "Permit Usage Access" ON',
    ],
  },
  xiaomi: {
    name: 'Xiaomi / Redmi / Poco (MIUI)',
    steps: [
      'Open Settings',
      'Go to Permissions',
      'Tap "Other permissions"',
      'Select "Usage access"',
      'Find "ScreenTimeBattle"',
      'Toggle "Permit Usage Access" ON',
    ],
  },
  huawei: {
    name: 'Huawei / Honor (EMUI)',
    steps: [
      'Open Settings',
      'Go to Apps',
      'Tap "Special Access"',
      'Select "Usage access"',
      'Find "ScreenTimeBattle"',
      'Toggle "Permit Usage Access" ON',
    ],
  },
  pixel: {
    name: 'Stock Android / Pixel / Android One',
    steps: [
      'Open Settings',
      'Go to Security (or Security & Location)',
      'Tap "Advanced"',
      'Select "Usage Access" (or "Apps with usage access")',
      'Find "ScreenTimeBattle"',
      'Toggle "Permit Usage Access" ON',
    ],
  },
};

export const UsagePermissionScreen: React.FC<UsagePermissionScreenProps> = ({
  onPermissionGranted,
}) => {
  const [checking, setChecking] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('pixel');

  const checkPermission = async () => {
    if (!UsageStatsModule || !UsageStatsModule.hasUsageStatsPermission) {
      console.warn('UsageStatsModule not available');
      return false;
    }

    try {
      setChecking(true);
      // React Native modules with Promise parameter return Promises directly
      const hasPermission = await UsageStatsModule.hasUsageStatsPermission();
      console.log('Permission check result:', hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    } finally {
      setChecking(false);
    }
  };

  const openUsageSettings = () => {
    try {
      if (Platform.OS === 'android' && UsageStatsModule && UsageStatsModule.openUsageAccessSettings) {
        // Use native method to open Usage Access Settings directly
        UsageStatsModule.openUsageAccessSettings();
      } else {
        // Fallback: open general settings
        Linking.openSettings().catch(() => {
          Alert.alert(
            'Open Settings Manually',
            'Please go to:\n\nSettings → Apps → Special app access → Usage access\n\nThen find "ScreenTimeBattle" and enable it.'
          );
        });
      }
    } catch (error) {
      console.error('Error opening settings:', error);
      // Fallback to general settings
      Linking.openSettings().catch(() => {
        Alert.alert(
          'Open Settings Manually',
          'Please go to:\n\nSettings → Apps → Special app access → Usage access\n\nThen find "ScreenTimeBattle" and enable it.'
        );
      });
    }
  };

  const handleCheckPermission = async () => {
    const hasPermission = await checkPermission();
    if (hasPermission) {
      onPermissionGranted();
    } else {
      Alert.alert(
        'Permission Not Granted',
        'Please enable usage access for ScreenTimeBattle in the settings that just opened, then come back and tap "Check Again".',
        [{ text: 'OK' }]
      );
    }
  };

  // Check permission on mount
  useEffect(() => {
    checkPermission().then((hasPermission) => {
      if (hasPermission) {
        onPermissionGranted();
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Usage Access Required</Text>
        
        <Text style={styles.description}>
          To track your social media usage, ScreenTimeBattle needs access to your app usage statistics.
        </Text>

        <Text style={styles.noteText}>
          If the button takes you to the app info instead, follow the instructions below
        </Text>

        {/* Device Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedDevice === 'samsung' && styles.tabActive]}
            onPress={() => setSelectedDevice('samsung')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedDevice === 'samsung' && styles.tabTextActive]}>
              Samsung
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedDevice === 'xiaomi' && styles.tabActive]}
            onPress={() => setSelectedDevice('xiaomi')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedDevice === 'xiaomi' && styles.tabTextActive]}>
              Xiaomi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedDevice === 'huawei' && styles.tabActive]}
            onPress={() => setSelectedDevice('huawei')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedDevice === 'huawei' && styles.tabTextActive]}>
              Huawei
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedDevice === 'pixel' && styles.tabActive]}
            onPress={() => setSelectedDevice('pixel')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedDevice === 'pixel' && styles.tabTextActive]}>
              Pixel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Device-Specific Instructions */}
        <ScrollView style={styles.instructionsContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.deviceName}>{DEVICE_INSTRUCTIONS[selectedDevice].name}</Text>
          <View style={styles.stepsContainer}>
            {DEVICE_INSTRUCTIONS[selectedDevice].steps.map((step, index) => (
              <View key={index} style={styles.step}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={openUsageSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCheckPermission}
            disabled={checking}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {checking ? 'Checking...' : 'Check Again'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          This permission is required to track your usage of TikTok, Instagram, YouTube, Facebook, and Snapchat.
        </Text>
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
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  noteText: {
    fontSize: 14,
    color: Colors.warning,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  instructionsContainer: {
    marginBottom: 24,
    maxHeight: 300,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsContainer: {
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    paddingTop: 4,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});

