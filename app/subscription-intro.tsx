
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { startFreeTrial, getSubscription } from '@/utils/subscription';
import Toast from '@/components/Toast';

const SUBSCRIPTION_INTRO_KEY = '@nutrion_subscription_intro_completed';

export default function SubscriptionIntroScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleStartFreeTrial = async () => {
    try {
      setLoading(true);
      console.log('Starting 15-day free trial...');
      
      // Check if user already has a subscription
      const existingSub = await getSubscription();
      
      if (existingSub && (existingSub.status === 'trial' || existingSub.status === 'active')) {
        console.log('User already has an active subscription');
        Toast.show({ 
          type: 'info', 
          message: 'You already have an active subscription!' 
        });
        
        // Mark subscription intro as completed
        await AsyncStorage.setItem(SUBSCRIPTION_INTRO_KEY, 'true');
        
        // Navigate to the main app
        router.replace('/(tabs)/pantry');
        return;
      }
      
      // Start the free trial in the database
      const success = await startFreeTrial();
      
      if (success) {
        // Mark subscription intro as completed
        await AsyncStorage.setItem(SUBSCRIPTION_INTRO_KEY, 'true');
        console.log('Free trial started successfully, navigating to app');
        
        Toast.show({ 
          type: 'success', 
          message: '🎉 Your 15-day free trial has started!' 
        });
        
        // Navigate to the main app
        router.replace('/(tabs)/pantry');
      } else {
        console.error('Failed to start free trial');
        Toast.show({ 
          type: 'error', 
          message: 'Failed to start free trial. Please try again or contact support.' 
        });
      }
    } catch (error: any) {
      console.error('Error starting free trial:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Please sign in to start your free trial.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Toast.show({ 
        type: 'error', 
        message: errorMessage 
      });
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
            <IconSymbol name="crown.fill" size={40} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('subscription.title') || 'Unlock Premium Features'}</Text>
          <Text style={styles.subtitle}>{t('subscription.subtitle') || 'Get full access to all features with our affordable subscription'}</Text>

          {/* Pricing Card */}
          <View style={styles.pricingCard}>
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.price}>1.99</Text>
              <Text style={styles.period}>/{t('subscription.month') || 'month'}</Text>
            </View>
            
            <View style={styles.trialBadge}>
              <IconSymbol name="gift.fill" size={20} color="#FFFFFF" />
              <Text style={styles.trialText}>15 Days Free Trial</Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>{t('subscription.whatYouGet') || 'What You Get'}</Text>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature1Title') || 'Smart Pantry Management'}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature1Desc') || 'Track all your food items with expiration alerts and smart categorization'}</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature2Title') || 'AI Recipe Suggestions'}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature2Desc') || 'Get personalized meal ideas based on ingredients you already have'}</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature3Title') || 'Shopping List Sync'}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature3Desc') || 'Automatically generate shopping lists and sync across devices'}</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('subscription.feature4Title') || 'Reduce Food Waste'}</Text>
                <Text style={styles.featureDescription}>{t('subscription.feature4Desc') || 'Save money and help the environment with smart expiration tracking'}</Text>
              </View>
            </View>
          </View>

          {/* Trial Info */}
          <View style={styles.trialInfo}>
            <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
            <Text style={styles.trialInfoText}>
              Try free for 15 days, then just $1.99 USD per month. Cancel anytime.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}
          onPress={handleStartFreeTrial}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <React.Fragment>
              <Text style={styles.continueButtonText}>
                {t('subscription.startTrial') || 'Start 15-Day Free Trial'}
              </Text>
              <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
            </React.Fragment>
          )}
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          {t('subscription.disclaimer') || 'No payment required during trial period'}
        </Text>
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
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0px 12px 32px ${colors.primary}20`,
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0px 8px 24px ${colors.primary}40`,
      },
    }),
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
