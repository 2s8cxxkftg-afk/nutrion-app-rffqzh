
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@nutrion_language';

// Import translation resources
const resources = {
  en: {
    translation: require('./translations/en.json'),
  },
  es: {
    translation: require('./translations/es.json'),
  },
  fr: {
    translation: require('./translations/fr.json'),
  },
  de: {
    translation: require('./translations/de.json'),
  },
  it: {
    translation: require('./translations/it.json'),
  },
  pt: {
    translation: require('./translations/pt.json'),
  },
  ru: {
    translation: require('./translations/ru.json'),
  },
  zh: {
    translation: require('./translations/zh.json'),
  },
  ja: {
    translation: require('./translations/ja.json'),
  },
  ko: {
    translation: require('./translations/ko.json'),
  },
  ar: {
    translation: require('./translations/ar.json'),
  },
  is: {
    translation: require('./translations/is.json'),
  },
  nl: {
    translation: require('./translations/nl.json'),
  },
  sv: {
    translation: require('./translations/sv.json'),
  },
  no: {
    translation: require('./translations/no.json'),
  },
  da: {
    translation: require('./translations/da.json'),
  },
  fi: {
    translation: require('./translations/fi.json'),
  },
  pl: {
    translation: require('./translations/pl.json'),
  },
  tr: {
    translation: require('./translations/tr.json'),
  },
  el: {
    translation: require('./translations/el.json'),
  },
};

// Get saved language or use device locale
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      console.log('Loaded saved language:', savedLanguage);
      return savedLanguage;
    }
    
    // Get device locale
    const deviceLocale = Localization.getLocales()[0];
    const languageCode = deviceLocale.languageCode || 'en';
    console.log('Using device language:', languageCode);
    
    // Map language codes to supported languages
    if (resources[languageCode as keyof typeof resources]) {
      return languageCode;
    }
    
    return 'en';
  } catch (error) {
    console.error('Error getting initial language:', error);
    return 'en';
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
      react: {
        useSuspense: false,
      },
      // Add missing key handler
      saveMissing: true,
      missingKeyHandler: (lng, ns, key, fallbackValue) => {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
        return fallbackValue || key;
      },
    });
  
  console.log('i18n initialized with language:', initialLanguage);
};

initI18n();

// Save language preference
export const changeLanguage = async (languageCode: string) => {
  try {
    console.log('Changing language to:', languageCode);
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
    console.log('Language changed successfully to:', languageCode);
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  ];
};

export default i18n;
