
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { startFreeTrial, getSubscription } from '@/utils/subscription';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTranslation } from 'react-i18next';
import Toast from '@/components/Toast';

const SUBSCRIPTION_INTRO_KEY = '@subscription_intro_shown';

export default function SubscriptionIntroScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartFreeTrial = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Toast.show(t('subscription.pleaseSignIn'), 'error');
        router.replace('/auth');
        return;
      }

      // Start free trial
      await startFreeTrial();
      
      // Mark intro as shown
      await AsyncStorage.setItem(SUBSCRIPTION_INTRO_KEY, 'true');
      
      Toast.show(t('subscription.trialStarted'), 'success');
      router.replace('/(tabs)/pantry');
    } catch (error) {
      console.error('Error starting trial:', error);
      Toast.show(t('subscription.trialError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <IconSymbol 
              ios_icon_name="leaf.fill" 
              android_material_icon_name="eco" 
              size={60} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.title}>{t('subscription.welcomeTitle')}</Text>
          <Text style={styles.subtitle}>{t('subscription.welcomeSubtitle')}</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol 
                ios_icon_name="camera.fill" 
                android_material_icon_name="camera" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('subscription.feature1Title')}</Text>
              <Text style={styles.featureDescription}>{t('subscription.feature1Description')}</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol 
                ios_icon_name="bell.fill" 
                android_material_icon_name="notifications" 
                size={24} 
                color={colors.warning} 
              />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('subscription.feature2Title')}</Text>
              <Text style={styles.featureDescription}>{t('subscription.feature2Description')}</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol 
                ios_icon_name="chart.bar.fill" 
                android_material_icon_name="bar-chart" 
                size={24} 
                color={colors.success} 
              />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('subscription.feature3Title')}</Text>
              <Text style={styles.featureDescription}>{t('subscription.feature3Description')}</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.info + '20' }]}>
              <IconSymbol 
                ios_icon_name="fork.knife" 
                android_material_icon_name="restaurant" 
                size={24} 
                color={colors.info} 
              />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('subscription.feature4Title')}</Text>
              <Text style={styles.featureDescription}>{t('subscription.feature4Description')}</Text>
            </View>
          </View>
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingContainer}>
          <View style={styles.pricingBadge}>
            <Text style={styles.pricingBadgeText}>{t('subscription.freeTrialBadge')}</Text>
          </View>
          <Text style={styles.pricingText}>{t('subscription.pricingInfo')}</Text>
          <Text style={styles.pricingSubtext}>{t('subscription.cancelAnytime')}</Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
          onPress={handleStartFreeTrial}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaButtonText}>{t('subscription.startFreeTrial')}</Text>
              <IconSymbol 
                ios_icon_name="arrow.right" 
                android_material_icon_name="arrow-forward" 
                size={20} 
                color="#fff" 
              />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.termsText}>{t('subscription.termsText')}</Text>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
  },
  featuresContainer: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  featureTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pricingContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  pricingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  pricingBadgeText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  pricingText: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  pricingSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    ...typography.button,
    color: '#fff',
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
