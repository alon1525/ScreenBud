import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TestScreen } from '../screens/TestScreen';

export type RootStackParamList = {
  TestScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="TestScreen" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

