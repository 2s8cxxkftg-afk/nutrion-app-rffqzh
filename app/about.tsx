
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export default function AboutScreen() {
  console.log('AboutScreen: Rendering about page');
  const router = useRouter();
  const { t } = useTranslation();

  const handleOpenWebsite = async () => {
    console.log('AboutScreen: Opening website');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://nutrion.app');
  };

  const handleOpenPrivacy = async () => {
    console.log('AboutScreen: Opening privacy policy');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://nutrion.app/privacy');
  };

  const handleOpenTerms = async () => {
    console.log('AboutScreen: Opening terms of service');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://nutrion.app/terms');
  };

  const handleOpenSupport = async () => {
    console.log('AboutScreen: Opening support email');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:support@nutrion.app');
  };

  const handleRateApp = async () => {
    console.log('AboutScreen: Opening app store for rating');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.nutrion.app',
      default: 'https://nutrion.app',
    });
    Linking.openURL(url);
  };

  const handleBack = async () => {
    console.log('AboutScreen: User tapped back button');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('about.title'),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleBack}
              style={styles.backButton}
            >
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back"
                size={24} 
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo and Name */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <IconSymbol
              ios_icon_name="leaf.fill"
              android_material_icon_name="eco"
              size={64}
              color={colors.primary}
            />
          </View>
          <Text style={styles.appName}>Nutrion</Text>
          <Text style={styles.version}>
            {t('about.version')} {Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            {t('about.description')}
          </Text>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.linkItem} onPress={handleOpenWebsite}>
            <View style={styles.linkIcon}>
              <IconSymbol 
                ios_icon_name="globe" 
                android_material_icon_name="language" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.website')}</Text>
              <Text style={styles.linkSubtitle}>nutrion.app</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleOpenPrivacy}>
            <View style={styles.linkIcon}>
              <IconSymbol 
                ios_icon_name="lock.shield.fill" 
                android_material_icon_name="lock" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.privacy')}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleOpenTerms}>
            <View style={styles.linkIcon}>
              <IconSymbol 
                ios_icon_name="doc.text.fill" 
                android_material_icon_name="description" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.terms')}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleOpenSupport}>
            <View style={styles.linkIcon}>
              <IconSymbol 
                ios_icon_name="envelope.fill" 
                android_material_icon_name="email" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.support')}</Text>
              <Text style={styles.linkSubtitle}>support@nutrion.app</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleRateApp}>
            <View style={styles.linkIcon}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.rateApp')}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('about.madeWith')}</Text>
          <Text style={styles.copyright}>{t('about.copyright')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: Platform.OS === 'ios' ? 0 : spacing.md,
    padding: 8,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  version: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  linkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  copyright: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
