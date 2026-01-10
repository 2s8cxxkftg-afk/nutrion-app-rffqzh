
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { shouldShowAds } from '@/utils/subscription';

interface AdBannerProps {
  onUpgradePress?: () => void;
}

/**
 * AdBanner component - Shows a placeholder ad banner
 * This can be replaced with a real ad SDK (Google AdMob, Facebook Audience Network, etc.)
 * 
 * TODO: Backend Integration - Replace with real ad network integration
 * For Google AdMob: Use react-native-google-mobile-ads
 * For Facebook: Use react-native-fbads
 */
export default function AdBanner({ onUpgradePress }: AdBannerProps) {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    const shouldShow = await shouldShowAds();
    setShowAd(shouldShow);
  };

  if (!showAd) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.adContent}>
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Advertisement</Text>
        </View>
        
        <View style={styles.adBody}>
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={32}
            color={colors.primary}
          />
          <View style={styles.adTextContainer}>
            <Text style={styles.adTitle}>Remove Ads</Text>
            <Text style={styles.adDescription}>
              Upgrade to Premium for an ad-free experience
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={onUpgradePress}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          <IconSymbol
            ios_icon_name="arrow.right"
            android_material_icon_name="arrow-forward"
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adContent: {
    alignItems: 'center',
  },
  adLabel: {
    backgroundColor: colors.textSecondary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  adLabelText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  adBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  adTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  adTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  adDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
});
