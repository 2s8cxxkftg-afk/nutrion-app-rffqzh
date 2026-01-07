
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="pantry" name="pantry">
        <Icon sf="archivebox.fill" />
        <Label>Pantry</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="shopping" name="shopping">
        <Icon sf="cart.fill" />
        <Label>Shopping</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
