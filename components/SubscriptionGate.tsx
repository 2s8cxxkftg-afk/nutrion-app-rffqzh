
/**
 * Subscription Gate Component
 * 
 * Wraps screens to enforce subscription access
 * Redirects to paywall if subscription is expired
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { hasActiveAccess } from '@/utils/subscription';
import { colors } from '@/styles/commonStyles';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const access = await hasActiveAccess();
      setHasAccess(access);
      
      if (!access) {
        router.replace('/paywall');
      }
    } catch (error) {
      console.error('Error checking subscription access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
