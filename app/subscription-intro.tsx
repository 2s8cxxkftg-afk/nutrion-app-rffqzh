
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startFreeTrial, getSubscription } from '@/utils/subscription';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const SUBSCRIPTION_INTRO_KEY = '@nutrion_subscription_intro_seen';

export default function SubscriptionIntroScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleStartFreeTrial = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Toast.show({
          type: 'error',
          message: t('subscription.pleaseSignIn'),
          duration: 3000,
        });
        router.replace('/auth');
        return;
      }

      const subscription = await getSubscription();
      
      if (subscription && subscription.status === 'trial') {
        await AsyncStorage.setItem(SUBSCRIPTION_INTRO_KEY, 'true');
        router.replace('/(tabs)/pantry');
        return;
      }

      if (subscription && subscription.status === 'active') {
        await AsyncStorage.setItem(SUBSCRIPTION_INTRO_KEY, 'true');
        router.replace('/(tabs)/pantry');
        return;
      }

      const result = await startFreeTrial();
      
      if (result) {
        Toast.show({
          type: 'success',
          message: t('subscription.freeTrialMessage'),
          duration: 3000,
        });
        await AsyncStorage.setItem(SUBSCRIPTION_INTRO_KEY, 'true');
        router.replace('/(tabs)/pantry');
      } else {
        Toast.show({
          type: 'error',
          message: t('subscription.failedToStart'),
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error starting trial:', error);
      Toast.show({
        type: 'error',
        message: error.message || t('subscription.anErrorOccurred'),
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <IconSymbol 
              ios_icon_name="leaf.fill" 
              android_material_icon_name="eco"
              size={64} 
              color="#FFFFFF" 
            />
          </View>
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
          <Text style={styles.usdLabel}>USD</Text>
          <View style={styles.trialBadge}>
            <IconSymbol 
              ios_icon_name="gift.fill" 
              android_material_icon_name="card_giftcard"
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.trialBadgeText}>{t('subscription.freeTrial')}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>{t('subscription.whatYouGet')}</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#4CAF50' + '20' }]}>
                <IconSymbol 
                  ios_icon_name="archivebox.fill" 
                  android_material_icon_name="inventory"
                  size={24} 
                  color="#4CAF50" 
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature1Title')}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature1Desc')}</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#2196F3' + '20' }]}>
                <IconSymbol 
                  ios_icon_name="cart.fill" 
                  android_material_icon_name="shopping_cart"
                  size={24} 
                  color="#2196F3" 
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature3Title')}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature3Desc')}</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#FF9800' + '20' }]}>
                <IconSymbol 
                  ios_icon_name="clock.fill" 
                  android_material_icon_name="schedule"
                  size={24} 
                  color="#FF9800" 
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature4Title')}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature4Desc')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trial Info */}
        <View style={styles.infoBox}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info"
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.infoText}>{t('subscription.trialInfo')}</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
          onPress={handleStartFreeTrial}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.ctaButtonText}>{t('subscription.continue')}</Text>
              <IconSymbol 
                ios_icon_name="arrow.right" 
                android_material_icon_name="arrow_forward"
                size={20} 
                color="#FFFFFF" 
              />
            </>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{t('subscription.disclaimer')}</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  heroContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    marginBottom: spacing.xl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: -32,
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  title: {
    ...typography.displayLarge,
    color: colors.text,
    textAlign: 'center',
    marginTop: 48,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  pricingCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
    elevation: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  currency: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 8,
  },
  price: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 72,
  },
  period: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 24,
  },
  usdLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  trialBadgeText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  featuresContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  featuresList: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    boxShadow: '0px 8px 24px rgba(76, 175, 80, 0.3)',
    elevation: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
