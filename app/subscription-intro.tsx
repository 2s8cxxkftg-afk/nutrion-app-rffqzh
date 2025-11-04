
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const SUBSCRIPTION_INTRO_KEY = '@nutrion_subscription_intro_completed';

export default function SubscriptionIntroScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem(SUBSCRIPTION_INTRO_KEY, 'true');
      console.log('Subscription intro completed, navigating to app');
      router.replace('/(tabs)/pantry');
    } catch (error) {
      console.error('Error saving subscription intro status:', error);
      router.replace('/(tabs)/pantry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Nutrion</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Premium Badge */}
          <View style={styles.premiumBadge}>
            <IconSymbol name="crown.fill" size={32} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('subscription.title')}</Text>
          <Text style={styles.subtitle}>{t('subscription.subtitle')}</Text>

          {/* Pricing Card */}
          <View style={styles.pricingCard}>
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.price}>1.99</Text>
              <Text style={styles.period}>/{t('subscription.month')}</Text>
            </View>
            
            <View style={styles.trialBadge}>
              <IconSymbol name="gift.fill" size={20} color="#FFFFFF" />
              <Text style={styles.trialText}>{t('subscription.freeTrial')}</Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>{t('subscription.whatYouGet')}</Text>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature1Title')}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature1Desc')}</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature2Title')}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature2Desc')}</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature3Title')}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature3Desc')}</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature4Title')}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature4Desc')}</Text>
              </View>
            </View>
          </View>

          {/* Trial Info */}
          <View style={styles.trialInfo}>
            <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
            <Text style={styles.trialInfoText}>{t('subscription.trialInfo')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>{t('subscription.continue')}</Text>
          <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>{t('subscription.disclaimer')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.displayMedium,
    color: colors.primary,
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  premiumBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.displayMedium,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 40,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 24,
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    marginBottom: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: `0px 12px 32px ${colors.primary}20`,
    elevation: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  currency: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 32,
    marginTop: 8,
  },
  price: {
    ...typography.displayLarge,
    fontSize: 72,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 72,
  },
  period: {
    ...typography.h3,
    color: colors.textSecondary,
    fontSize: 20,
    marginTop: 40,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  trialText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  featuresContainer: {
    marginBottom: spacing.xxxl,
  },
  featuresTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
    fontSize: 22,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: spacing.lg,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    fontSize: 17,
  },
  featureDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  trialInfoText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
    boxShadow: `0px 8px 24px ${colors.primary}40`,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontSize: 18,
  },
  disclaimer: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
