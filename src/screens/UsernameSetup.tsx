/**
 * Username Setup Screen - First time user setup
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { setUsername, usernameExists } from '../services/auth';

export const UsernameSetup: React.FC = () => {
  const { user, refreshUsername } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState<boolean | null>(null); // null = not checked, true = taken, false = available
  const [finalUsername, setFinalUsername] = useState<string>('');

  // Update final username preview when text changes
  useEffect(() => {
    const trimmedFirstName = firstName.trim();
    const trimmedNickname = nickname.trim();
    
    if (trimmedFirstName && trimmedNickname && trimmedFirstName.length >= 2 && trimmedNickname.length >= 2) {
      setFinalUsername(`${trimmedFirstName} ${trimmedNickname}`);
      // Reset availability check when text changes
      setUsernameTaken(null);
    } else {
      setFinalUsername('');
      setUsernameTaken(null);
    }
  }, [firstName, nickname]);

  const handleCheckAvailability = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedFirstName || !trimmedNickname) {
      Alert.alert('Required Fields', 'Please enter both first name and nickname.');
      return;
    }

    if (trimmedFirstName.length < 2) {
      Alert.alert('Invalid First Name', 'First name must be at least 2 characters.');
      return;
    }

    if (trimmedNickname.length < 2) {
      Alert.alert('Invalid Nickname', 'Nickname must be at least 2 characters.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No user found. Please try again.');
      return;
    }

    setCheckingUsername(true);
    try {
      const username = `${trimmedFirstName} ${trimmedNickname}`.trim();
      
      // Show loading state immediately
      console.log('Checking username availability...');
      const startTime = Date.now();
      
      const exists = await usernameExists(username, user.uid);
      
      const duration = Date.now() - startTime;
      console.log(`Username check completed in ${duration}ms`);
      
      setUsernameTaken(exists);
    } catch (error: any) {
      console.error('Error checking username:', error);
      const errorMessage = error?.message || 'Failed to check username availability.';
      
      // Show detailed error message with actionable steps
      let alertMessage = errorMessage;
      
      if (errorMessage.includes('index')) {
        alertMessage += '\n\n1. Check the console for an index creation link\n2. Or create it manually in Firebase Console\n3. Wait 1-2 minutes for it to build';
      } else if (errorMessage.includes('timeout')) {
        alertMessage += '\n\nPlease check your internet connection and try again.';
      } else if (errorMessage.includes('permission')) {
        alertMessage += '\n\nMake sure Firestore security rules allow reading the users collection.';
      }
      
      Alert.alert(
        'Error Checking Username',
        alertMessage,
        [
          {
            text: 'OK',
            onPress: () => setUsernameTaken(null),
          },
        ]
      );
      setUsernameTaken(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'No user found. Please try again.');
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedFirstName) {
      Alert.alert('First Name Required', 'Please enter your first name.');
      return;
    }

    if (!trimmedNickname) {
      Alert.alert('Nickname Required', 'Please enter a nickname.');
      return;
    }

    if (trimmedFirstName.length < 2) {
      Alert.alert('Invalid First Name', 'First name must be at least 2 characters.');
      return;
    }

    if (trimmedNickname.length < 2) {
      Alert.alert('Invalid Nickname', 'Nickname must be at least 2 characters.');
      return;
    }

    // Check if username is taken (if availability was checked)
    if (usernameTaken === true) {
      Alert.alert('Username Taken', 'This username is already taken. Please choose a different first name or nickname.');
      return;
    }

    // If availability wasn't checked (null), we'll check it during submit
    // This handles cases where the check failed due to index/connection issues

    setLoading(true);
    try {
      // setUsername will check uniqueness before saving
      await setUsername(user.uid, trimmedFirstName, trimmedNickname);
      // Refresh username check in auth context
      await refreshUsername();
      // The auth context will detect the username change and navigate to dashboard
    } catch (error: any) {
      console.error('Error setting username:', error);
      const errorMessage = error?.message || 'Failed to set username. Please try again.';
      
      // If username is taken, update the UI state
      if (errorMessage.includes('already taken') || errorMessage.includes('taken')) {
        setUsernameTaken(true);
        Alert.alert('Username Taken', errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to ScreenTimeBattle! 🎮</Text>
            <Text style={styles.subtitle}>
              Let's set up your profile to get started
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor={Colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a nickname"
                placeholderTextColor={Colors.textSecondary}
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {finalUsername && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Your username will be: <Text style={styles.usernamePreview}>{finalUsername}</Text>
                </Text>
              </View>
            )}

            {usernameTaken !== null && (
              <View style={[styles.infoBox, usernameTaken ? styles.infoBoxError : styles.infoBoxSuccess]}>
                <Text style={[styles.infoText, usernameTaken ? styles.infoTextError : styles.infoTextSuccess]}>
                  {checkingUsername ? (
                    'Checking availability...'
                  ) : usernameTaken ? (
                    <>
                      ⚠️ Username "{finalUsername}" is already taken.{'\n'}
                      Please choose a different first name or nickname.
                    </>
                  ) : (
                    <>
                      ✓ Username "{finalUsername}" is available!
                    </>
                  )}
                </Text>
              </View>
            )}

            {finalUsername && (
              <TouchableOpacity
                style={[styles.checkButton, checkingUsername && styles.checkButtonDisabled]}
                onPress={handleCheckAvailability}
                disabled={checkingUsername}
                activeOpacity={0.7}
              >
                {checkingUsername ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.checkButtonText}>Check Availability</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, (loading || usernameTaken) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading || usernameTaken}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  infoBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  infoBoxError: {
    backgroundColor: '#FFF5F5',
    borderColor: Colors.error,
  },
  infoBoxSuccess: {
    backgroundColor: '#F0FFF4',
    borderColor: Colors.success,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoTextError: {
    color: Colors.error,
  },
  infoTextSuccess: {
    color: Colors.success,
  },
  checkButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 48,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  usernamePreview: {
    fontWeight: '700',
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

