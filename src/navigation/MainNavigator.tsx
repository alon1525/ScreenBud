import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dashboard } from '../screens/Dashboard';
import { Leaderboard } from '../screens/Leaderboard';
import { AddFriends } from '../screens/AddFriends';
import { Colors } from '../constants/colors';
import { HomeIcon, TrophyIcon, UserPlusIcon } from '../components/common/TabIcons';

export type MainTabParamList = {
  Dashboard: undefined;
  Leaderboard: undefined;
  AddFriends: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60 + insets.bottom, // Base height + safe area bottom
          paddingBottom: insets.bottom + 8, // Safe area + padding
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: 'Daily Usage',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <TrophyIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AddFriends"
        component={AddFriends}
        options={{
          tabBarLabel: 'Add Friends',
          tabBarIcon: ({ color, size }) => <UserPlusIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

