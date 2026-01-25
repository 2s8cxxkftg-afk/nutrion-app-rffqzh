
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Inline English translations to avoid file loading issues
const en = {
  common: {
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
  },
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
  },
  pantry: {
    title: 'Pantry',
    addItem: 'Add Item',
    scanBarcode: 'Scan Barcode',
    noItems: 'No items in your pantry',
  },
  shopping: {
    title: 'Shopping List',
    addItem: 'Add Item',
    noItems: 'No items in your shopping list',
  },
};

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
  })
  .catch((error) => {
    console.error('i18next initialization error:', error);
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
