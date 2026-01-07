
import React from 'react';
import { Slot } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  // Define the tabs configuration for Nutrion (removed planner tab)
  const tabs: TabBarItem[] = [
    {
      name: 'pantry',
      route: '/(tabs)/pantry',
      icon: 'inventory',
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
      <Slot />
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
