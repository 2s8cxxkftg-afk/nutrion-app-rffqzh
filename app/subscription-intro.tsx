
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  featuresContainer: {
    marginVertical: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  pricingContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pricingText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});

const features = [
  {
    icon: 'leaf.fill',
    androidIcon: 'eco',
    color: colors.success,
    title: '🎯 Smart Pantry Tracking',
    description: 'Scan barcodes instantly or add items manually - track your entire food inventory with ease!',
  },
  {
    icon: 'bell.fill',
    androidIcon: 'notifications',
    color: colors.warning,
    title: '⚡ Powerful Expiration Alerts',
    description: 'Get notified before food expires so nothing goes to waste - save money and the planet!',
  },
  {
    icon: 'chart.bar.fill',
    androidIcon: 'bar_chart',
    color: colors.info,
    title: '📊 Amazing Waste Analytics',
    description: 'Watch your savings grow! See exactly how much money and food you\'re saving over time!',
  },
  {
    icon: 'fork.knife',
    androidIcon: 'restaurant',
    color: colors.primary,
    title: '🍳 Intelligent Meal Planning',
    description: 'Get delicious recipe suggestions based on what\'s already in your pantry - cooking made easy!',
  },
];

export default function SubscriptionIntroScreen() {
  const router = useRouter();

  const handleStartTrial = () => {
    router.push('/auth');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol 
              ios_icon_name="leaf.fill" 
              android_material_icon_name="eco" 
              size={40} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.title}>🚀 Welcome to Nutrion!</Text>
          <Text style={styles.subtitle}>
            Transform your kitchen! Track your pantry, eliminate waste, and save money with smart food management!
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: `${feature.color}20` },
                ]}
              >
                <IconSymbol 
                  ios_icon_name={feature.icon} 
                  android_material_icon_name={feature.androidIcon} 
                  size={20} 
                  color={feature.color} 
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎉 15 DAYS FREE TRIAL!</Text>
          </View>
          <Text style={styles.pricingText}>Only $1.99/month</Text>
          <Text style={styles.cancelText}>Cancel anytime - No commitment!</Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={handleStartTrial}>
          <Text style={styles.ctaButtonText}>🚀 Start Your Free Trial Now!</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Your trial will automatically convert to a paid subscription unless cancelled.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
