
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { activatePremiumSubscription, getSubscriptionPrice } from '@/utils/subscription';
import Toast from '@/components/Toast';

export default function PaywallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const price = getSubscriptionPrice();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would integrate with Stripe or another payment provider
      // For now, we'll just activate the subscription
      await activatePremiumSubscription();
      
      Toast.show('Subscription activated successfully!', 'success');
      router.replace('/(tabs)/pantry');
    } catch (error) {
      console.error('Subscription error:', error);
      Toast.show('Failed to activate subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            router.replace('/auth');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Subscribe',
          headerShown: true,
          headerBackVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol 
            ios_icon_name="star.fill" 
            android_material_icon_name="star" 
            size={80} 
            color={colors.primary} 
          />
        </View>

        <Text style={styles.title}>Your Free Trial Has Ended</Text>

        <Text style={styles.subtitle}>
          Subscribe to continue using Nutrion and keep tracking your pantry
        </Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceAmount}>${price.toFixed(2)}</Text>
          <Text style={styles.pricePeriod}>per month</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          
          {[
            { text: 'Smart Pantry Inventory' },
            { text: 'Expiration Alerts' },
            { text: 'Shopping List' },
            { text: 'Analytics Dashboard' },
            { text: 'Cloud Sync' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={24} 
                color={colors.success} 
              />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              <IconSymbol 
                ios_icon_name="arrow.right" 
                android_material_icon_name="arrow_forward" 
                size={20} 
                color="#fff" 
              />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Cancel anytime. No hidden fees.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  priceCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureText: {
    fontSize: 16,
    marginLeft: spacing.sm,
    color: colors.text,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginRight: spacing.sm,
  },
  disclaimer: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  signOutButton: {
    marginRight: spacing.md,
  },
  signOutText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
