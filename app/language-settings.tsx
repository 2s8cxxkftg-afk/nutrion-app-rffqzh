
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '@/utils/i18n';
import Toast from '@/components/Toast';
import * as Haptics from 'expo-haptics';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [isChanging, setIsChanging] = useState(false);
  const languages = getAvailableLanguages();

  useEffect(() => {
    // Update current language when i18n language changes
    const handleLanguageChange = (lng: string) => {
      console.log('Language changed event:', lng);
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = async (languageCode: string) => {
    if (isChanging || languageCode === currentLang) {
      return;
    }

    try {
      setIsChanging(true);
      
      // Haptic feedback
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
      
      console.log('Changing language from', currentLang, 'to', languageCode);
      
      // Change the language - this will trigger app-wide update
      const success = await changeLanguage(languageCode);
      
      if (success) {
        // Update local state
        setCurrentLang(languageCode);
        
        console.log('✅ Language changed successfully to:', languageCode);
        
        // Show success message
        Toast.show({
          message: t('language.changeSuccess'),
          type: 'success',
          duration: 2000,
        });
        
        // Navigate back after a short delay to allow the toast to show
        setTimeout(() => {
          router.back();
        }, 500);
      } else {
        throw new Error('Failed to change language');
      }
      
    } catch (error) {
      console.error('❌ Error changing language:', error);
      Toast.show({
        message: t('language.changeError'),
        type: 'error',
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('language.title'),
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
        <Text style={styles.sectionTitle}>{t('language.selectLanguage')}</Text>
        <Text style={styles.sectionDescription}>
          {t('language.description')}
        </Text>

        <View style={styles.languageList}>
          {languages.map((language) => {
            const isSelected = currentLang === language.code;
            return (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  isSelected && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageChange(language.code)}
                activeOpacity={0.7}
                disabled={isChanging || isSelected}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNative}>{language.nativeName}</Text>
                </View>
                {isChanging && currentLang === language.code ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : isSelected ? (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <IconSymbol name="info.circle" size={20} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {t('language.infoText')}
          </Text>
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  languageList: {
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
