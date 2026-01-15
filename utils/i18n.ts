
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';

// Initialize i18next with English translations
i18next
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: en,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = async (languageCode: string) => {
  console.log('Language switching disabled - English only');
  return true;
};

export const getCurrentLanguage = (): string => {
  return 'en';
};

export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
  ];
};

export default i18next;
