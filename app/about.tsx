
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
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.nutrion.app',
      default: 'https://nutrion.app',
    });
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('about.title') || 'About Nutrion',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'modal',
        }}
      />

      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo and Name */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
            style={styles.logo}
            resizeMode="contain"
          />
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
              <IconSymbol name="globe" size={24} color={colors.primary} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.website')}</Text>
              <Text style={styles.linkSubtitle}>nutrion.app</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleOpenPrivacy}>
            <View style={styles.linkIcon}>
              <IconSymbol name="lock.shield.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.privacy')}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleOpenTerms}>
            <View style={styles.linkIcon}>
              <IconSymbol name="doc.text.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.terms')}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleOpenSupport}>
            <View style={styles.linkIcon}>
              <IconSymbol name="envelope.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.support')}</Text>
              <Text style={styles.linkSubtitle}>support@nutrion.app</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={handleRateApp}>
            <View style={styles.linkIcon}>
              <IconSymbol name="star.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>{t('about.rateApp')}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  linkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    paddingTop: 32,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  copyright: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
