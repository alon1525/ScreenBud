import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dashboard } from '../screens/Dashboard';
import { Leaderboard } from '../screens/Leaderboard';
import { FriendsList } from '../screens/FriendsList';
import { Wellbeing } from '../screens/Wellbeing';
import { Colors } from '../constants/colors';
import { HomeIcon, TrophyIcon } from '../components/common/TabIcons';

export type LeaderboardStackParamList = {
  Leaderboard: undefined;
  FriendsList: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  LeaderboardStack: undefined;
  Wellbeing: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const LeaderboardStack = createNativeStackNavigator<LeaderboardStackParamList>();

const LeaderboardStackNavigator = () => {
  return (
    <LeaderboardStack.Navigator screenOptions={{ headerShown: false }}>
      <LeaderboardStack.Screen name="Leaderboard" component={Leaderboard} />
      <LeaderboardStack.Screen 
        name="FriendsList" 
        component={FriendsList}
        options={{
          headerShown: true,
          title: 'Friends',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />
    </LeaderboardStack.Navigator>
  );
};

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
        name="LeaderboardStack"
        component={LeaderboardStackNavigator}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <TrophyIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Wellbeing"
        component={Wellbeing}
        options={{
          tabBarLabel: 'Wellbeing',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🧘</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

