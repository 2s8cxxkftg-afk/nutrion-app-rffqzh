
import React from 'react';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="basket.fill" 
              android_material_icon_name="inventory" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="cart.fill" 
              android_material_icon_name="shopping_cart" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              color={color} 
            />
          ),
        }}
      />
      {/* Planner tab removed as requested by user */}
      <Tabs.Screen
        name="planner"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
