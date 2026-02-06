
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: 'pantry',
      route: '/(tabs)/pantry',
      icon: 'kitchen',
      label: 'Pantry',
    },
    {
      name: 'shopping',
      route: '/(tabs)/shopping',
      icon: 'shopping-cart',
      label: 'Shopping',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="pantry" />
        <Stack.Screen name="shopping" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
