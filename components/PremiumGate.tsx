
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function PremiumGate({ visible, onClose, featureName }: PremiumGateProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    onClose();
    router.push('/subscription-management');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Premium Icon */}
          <View style={styles.iconContainer}>
            <IconSymbol name="crown.fill" size={64} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('subscription.premiumRequired')}</Text>
          
          {/* Description */}
          <Text style={styles.description}>
            {featureName 
              ? `${featureName} is a premium feature. Upgrade now to unlock all features!`
              : t('subscription.premiumRequiredDesc')
            }
          </Text>

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text style={styles.featureText}>Expiration Date Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text style={styles.featureText}>AI Meal Planner</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text style={styles.featureText}>Unlimited Pantry Items</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text style={styles.featureText}>Priority Support</Text>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <Text style={styles.price}>$1.99</Text>
            <Text style={styles.period}>/month</Text>
          </View>

          <Text style={styles.trialText}>30 Days Free Trial</Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <IconSymbol name="crown.fill" size={20} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>{t('subscription.upgradeToPremium')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.displayLarge,
    fontSize: 48,
    color: colors.primary,
    fontWeight: '900',
  },
  period: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: 16,
  },
  trialText: {
    ...typography.label,
    color: colors.success,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    width: '100%',
    marginBottom: spacing.md,
    gap: spacing.sm,
    boxShadow: `0px 8px 24px ${colors.primary}40`,
    elevation: 6,
  },
  upgradeButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  closeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  closeButtonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
