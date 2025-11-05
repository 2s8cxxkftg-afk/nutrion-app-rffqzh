
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { changeLanguage, getAvailableLanguages } from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const LANGUAGE_SELECTED_KEY = '@nutrion_language_selected';

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const languages = getAvailableLanguages();

  const handleLanguageSelect = async (languageCode: string) => {
    if (isChanging) return;

    try {
      setIsChanging(true);
      setSelectedLanguage(languageCode);

      // Haptic feedback
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available:', error);
      }

      console.log('Setting initial language to:', languageCode);

      // Change the language
      const success = await changeLanguage(languageCode);

      if (success) {
        // Mark that language has been selected
        await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
        console.log('✅ Language set successfully, navigating to onboarding');

        // Navigate to onboarding after a short delay
        setTimeout(() => {
          router.replace('/onboarding');
        }, 300);
      } else {
        throw new Error('Failed to change language');
      }
    } catch (error) {
      console.error('❌ Error setting language:', error);
      setIsChanging(false);
      setSelectedLanguage(null);
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

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <IconSymbol name="globe" size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>
            Select your preferred language to get started. You can change this later in settings.
          </Text>

          {/* Language List */}
          <View style={styles.languageList}>
            {languages.map((language) => {
              const isSelected = selectedLanguage === language.code;
              const isLoading = isChanging && isSelected;

              return (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                  activeOpacity={0.7}
                  disabled={isChanging}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNative}>{language.nativeName}</Text>
                  </View>
                  {isLoading ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : isSelected ? (
                    <IconSymbol name="checkmark.circle.fill" size={28} color={colors.primary} />
                  ) : (
                    <View style={styles.languageCircle} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
    marginBottom: spacing.xxxl,
    marginTop: spacing.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.displayMedium,
    color: colors.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.displayMedium,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  languageList: {
    gap: spacing.md,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  languageItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
    boxShadow: `0px 4px 16px ${colors.primary}30`,
    elevation: 4,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    fontSize: 18,
    fontWeight: '600',
  },
  languageNative: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 15,
  },
  languageCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
});
