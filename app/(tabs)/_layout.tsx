
import React from 'react';
import { Slot } from 'expo-router';
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
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
