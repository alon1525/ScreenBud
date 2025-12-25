import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { socialMediaTrackingService } from '../services/socialMediaTracking';

interface AddFriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      // Search for user by username
      const usersSnapshot = await firestore()
        .collection('users')
        .where('username', '==', username.trim().toLowerCase())
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const friendDoc = usersSnapshot.docs[0];
      const friendId = friendDoc.id;

      if (friendId === user.uid) {
        Alert.alert('Error', 'Cannot add yourself as a friend');
        return;
      }

      await socialMediaTrackingService.addFriend(user.uid, friendId);
      Alert.alert('Success', `Added ${username} as a friend!`);
      setUsername('');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  };


  const handleShareLink = async () => {
    if (!user) return;

    try {
      // Generate shareable link - when clicked, it will automatically add both users as friends
      const shareLink = `screentimebattle://add-friend/${user.uid}`;
      
      await Share.share({
        message: `Join me on ScreenTimeBattle! Click this link to add me as a friend: ${shareLink}`,
        title: 'Add me on ScreenTimeBattle',
        url: shareLink, // For platforms that support it
      });
    } catch (error: any) {
      // User cancelled sharing
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share link');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { marginTop: insets.top + 40 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Friends</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scrollView}>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
                {/* Add by Username */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Add by Username</Text>
                  <Text style={styles.sectionDescription}>
                    Search for a friend by their username
                  </Text>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter username"
                      placeholderTextColor={Colors.textSecondary}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                      onPress={handleSearch}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.searchButtonText}>Add</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Share Your Link */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Share Your Link</Text>
                  <Text style={styles.sectionDescription}>
                    Share your unique link with friends so they can add you
                  </Text>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareLink}
                  >
                    <Text style={styles.shareButtonText}>Share My Link</Text>
                  </TouchableOpacity>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    When you add friends, you'll be able to see their screen time and
                    compete on the leaderboard!
                  </Text>
                </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 500,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});

