
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from './IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { isPremiumUser } from '@/utils/subscription';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
}

export default function SubscriptionGate({ children, feature }: SubscriptionGateProps) {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Wrap checkAccess with useCallback to stabilize its reference
  const checkAccess = useCallback(async () => {
    try {
      const premium = await isPremiumUser();
      setIsPremium(premium);
    } catch (error) {
      console.log('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]); // Fixed: Added checkAccess to dependencies

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={styles.gateContainer}>
        <View style={styles.gateContent}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={48}
              color={colors.primary}
            />
          </View>
          
          <Text style={styles.gateTitle}>Premium Feature</Text>
          <Text style={styles.gateDescription}>
            {feature} is a premium feature. Upgrade to access this and other exclusive features.
          </Text>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/subscription-intro')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  gateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  gateContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...commonStyles.shadow,
  },
  gateTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  gateDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...commonStyles.shadow,
  },
  upgradeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.background,
  },
  backButton: {
    width: '100%',
    padding: spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});
