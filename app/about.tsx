
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleOpenWebsite = () => {
    Linking.openURL('https://nutrion.app');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://nutrion.app/privacy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://nutrion.app/terms');
  };

  const handleOpenSupport = () => {
    Linking.openURL('mailto:support@nutrion.app');
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/nutrion',
      android: 'https://play.google.com/store/apps/details?id=com.nutrion.app',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'About Nutrion',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        }}
      />

      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Nutrion</Text>
          <Text style={styles.tagline}>Your Smart Kitchen Companion</Text>
          <View style={styles.versionContainer}>
            <Text style={styles.version}>Version {appVersion} ({buildNumber})</Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.section}>
          <View style={styles.missionCard}>
            <IconSymbol name="leaf.fill" size={32} color={colors.success} />
            <Text style={styles.missionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              Nutrion helps you manage your pantry, reduce food waste, and discover delicious recipes 
              based on what you already have. We believe in sustainable living and making the most of 
              every ingredient in your kitchen.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="qrcode.viewfinder" size={24} color={colors.primary} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Smart Barcode Scanning</Text>
                <Text style={styles.featureDescription}>
                  Quickly add items by scanning barcodes
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="brain.head.profile" size={24} color={colors.accent} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>AI Expiration Prediction</Text>
                <Text style={styles.featureDescription}>
                  Intelligent predictions for fresh foods without labels
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="bell.badge.fill" size={24} color={colors.warning} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Expiration Alerts</Text>
                <Text style={styles.featureDescription}>
                  Never let food go to waste with timely notifications
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="wand.and.stars" size={24} color={colors.secondary} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>AI Recipe Suggestions</Text>
                <Text style={styles.featureDescription}>
                  Get personalized meal ideas based on your pantry
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="cart.fill" size={24} color={colors.primary} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Smart Shopping Lists</Text>
                <Text style={styles.featureDescription}>
                  Organize your grocery shopping efficiently
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>30%</Text>
              <Text style={styles.statLabel}>Less Food Waste</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$500+</Text>
              <Text style={styles.statLabel}>Avg. Yearly Savings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>10K+</Text>
              <Text style={styles.statLabel}>Happy Users</Text>
            </View>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Information</Text>
          <View style={styles.linksList}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleOpenWebsite}
              activeOpacity={0.7}
            >
              <View style={styles.linkInfo}>
                <IconSymbol name="globe" size={24} color={colors.primary} />
                <Text style={styles.linkText}>Visit Our Website</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleOpenSupport}
              activeOpacity={0.7}
            >
              <View style={styles.linkInfo}>
                <IconSymbol name="envelope.fill" size={24} color={colors.primary} />
                <Text style={styles.linkText}>Contact Support</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleRateApp}
              activeOpacity={0.7}
            >
              <View style={styles.linkInfo}>
                <IconSymbol name="star.fill" size={24} color={colors.warning} />
                <Text style={styles.linkText}>Rate Nutrion</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleOpenPrivacy}
              activeOpacity={0.7}
            >
              <View style={styles.linkInfo}>
                <IconSymbol name="lock.shield.fill" size={24} color={colors.primary} />
                <Text style={styles.linkText}>Privacy Policy</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleOpenTerms}
              activeOpacity={0.7}
            >
              <View style={styles.linkInfo}>
                <IconSymbol name="doc.text.fill" size={24} color={colors.primary} />
                <Text style={styles.linkText}>Terms of Service</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <View style={styles.creditsCard}>
            <Text style={styles.creditsTitle}>Made with ❤️</Text>
            <Text style={styles.creditsText}>
              Nutrion is built with care to help you live more sustainably and reduce food waste. 
              Thank you for being part of our mission!
            </Text>
            <Text style={styles.copyright}>© 2024 Nutrion. All rights reserved.</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  versionContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  version: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  missionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  missionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  missionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  linksList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  creditsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
  },
  creditsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  creditsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  copyright: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
