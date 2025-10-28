
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

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

  // Use NativeTabs for iOS, custom FloatingTabBar for Android and Web
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="pantry">
          <Icon sf="archivebox.fill" drawable="ic_pantry" />
          <Label>Pantry</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="planner">
          <Icon sf="calendar" drawable="ic_planner" />
          <Label>Planner</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="shopping">
          <Icon sf="cart.fill" drawable="ic_shopping" />
          <Label>Shopping</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.fill" drawable="ic_profile" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // For Android and Web, use Stack navigation with custom floating tab bar
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
