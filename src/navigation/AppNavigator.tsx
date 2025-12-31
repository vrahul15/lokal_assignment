import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/usePlayerStore';
import MiniPlayer from '../components/MiniPlayer';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
};

export type TabParamList = {
  Home: undefined;
  Queue: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const miniPlayerHeight = 74;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: currentSong ? miniPlayerHeight : 0,
          height: currentSong ? 60 + miniPlayerHeight : 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack.Navigator>

      {/* 👇 THIS IS THE IMPORTANT PART */}
      <MiniPlayer />
    </NavigationContainer>
  );
};

export default AppNavigator;
