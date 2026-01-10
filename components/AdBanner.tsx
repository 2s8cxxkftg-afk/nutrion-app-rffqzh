
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { isPremiumUser } from '@/utils/subscription';
import * as Haptics from 'expo-haptics';

export default function AdBanner() {
  const router = useRouter();
  const [isPremium, setIsPremium] = React.useState(false);

  React.useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  };

  if (isPremium) {
    return null;
  }

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/subscription-management');
  };

  return (
    <View style={styles.container}>
      <View style={styles.adContent}>
        <Text style={styles.adLabel}>AD</Text>
        <Text style={styles.adText}>Remove ads with Premium</Text>
      </View>
      <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
        <Text style={styles.upgradeText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginHorizontal: spacing.medium,
    marginVertical: spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: spacing.small,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  adText: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.small,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.small,
    fontWeight: '600',
  },
});
