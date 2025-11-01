
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  // Define the tabs configuration for Nutrion
  const tabs: TabBarItem[] = [
    {
      name: 'pantry',
      route: '/(tabs)/pantry',
      icon: 'archivebox.fill',
      label: 'Pantry',
    },
    {
      name: 'planner',
      route: '/(tabs)/planner',
      icon: 'calendar',
      label: 'Planner',
    },
    {
      name: 'shopping',
      route: '/(tabs)/shopping',
      icon: 'cart.fill',
      label: 'Shopping',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.fill',
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
        <Stack.Screen name="pantry" />
        <Stack.Screen name="planner" />
        <Stack.Screen name="shopping" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
