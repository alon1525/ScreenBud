import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { socialMediaTrackingService } from '../services/socialMediaTracking';

interface Friend {
  uid: string;
  username: string;
  nickname?: string;
}

export const FriendsList: React.FC = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'blocked'>('friends');

  const loadFriends = async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      
      // Load friends
      const friendIds = await socialMediaTrackingService.getFriends(user.uid);
      const friendPromises = friendIds.map(async (uid) => {
        const userDoc = await firestore().collection('users').doc(uid).get();
        const userData = userDoc.data();
        return {
          uid,
          username: userData?.username || 'Unknown',
          nickname: userData?.nickname,
        };
      });
      const friendsList = await Promise.all(friendPromises);
      setFriends(friendsList);

      // Load blocked users
      const blockedIds = await socialMediaTrackingService.getBlockedUsers(user.uid);
      const blockedPromises = blockedIds.map(async (uid) => {
        const userDoc = await firestore().collection('users').doc(uid).get();
        const userData = userDoc.data();
        return {
          uid,
          username: userData?.username || 'Unknown',
          nickname: userData?.nickname,
        };
      });
      const blockedList = await Promise.all(blockedPromises);
      setBlockedUsers(blockedList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, [user?.uid]);

  const handleDeleteFriend = (friend: Friend) => {
    if (!user) return;

    Alert.alert(
      'Delete Friend',
      `Are you sure you want to remove ${friend.nickname || friend.username} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialMediaTrackingService.deleteFriend(user.uid, friend.uid);
              await loadFriends();
              Alert.alert('Success', 'Friend removed');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete friend');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = (friend: Friend) => {
    if (!user) return;

    Alert.alert(
      'Block User',
      `Are you sure you want to block ${friend.nickname || friend.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialMediaTrackingService.blockUser(user.uid, friend.uid);
              await loadFriends();
              Alert.alert('Success', 'User blocked');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleUnblockUser = (blockedUser: Friend) => {
    if (!user) return;

    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${blockedUser.nickname || blockedUser.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await socialMediaTrackingService.unblockUser(user.uid, blockedUser.uid);
              await loadFriends();
              Alert.alert('Success', 'User unblocked');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to unblock user');
            }
          },
        },
      ]
    );
  };

  const bottomPadding = 60 + insets.bottom + 16;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentList = activeTab === 'friends' ? friends : blockedUsers;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'blocked' && styles.tabActive]}
          onPress={() => setActiveTab('blocked')}
        >
          <Text style={[styles.tabText, activeTab === 'blocked' && styles.tabTextActive]}>
            Blocked ({blockedUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFriends} />}
      >
        {currentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'friends' ? 'No friends yet' : 'No blocked users'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'friends'
                ? 'Add friends to see them here'
                : 'Blocked users will appear here'}
            </Text>
          </View>
        ) : (
          currentList.map((item) => (
            <View key={item.uid} style={styles.friendCard}>
              <View style={styles.friendInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(item.nickname || item.username).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{item.nickname || item.username}</Text>
                  {item.nickname && (
                    <Text style={styles.friendUsername}>@{item.username}</Text>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                {activeTab === 'friends' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.blockButton, { marginRight: 8 }]}
                      onPress={() => handleBlockUser(item)}
                    >
                      <Text style={styles.actionButtonText}>Block</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteFriend(item)}
                    >
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.unblockButton]}
                    onPress={() => handleUnblockUser(item)}
                  >
                    <Text style={styles.actionButtonText}>Unblock</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: 'center',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tabTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  blockButton: {
    backgroundColor: Colors.warning,
  },
  unblockButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

