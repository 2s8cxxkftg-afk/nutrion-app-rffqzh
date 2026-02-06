
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

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
  onboarding: {
    next: 'Next',
    skip: 'Skip',
    getStarted: 'Get Started',
    'page1.title': 'Smart Pantry Management',
    'page1.description': 'Track every item in your pantry and never miss an expiration date again!',
    'page2.title': 'Expiration Alerts',
    'page2.description': 'Get notified before items expire and reduce food waste.',
    'page3.title': 'Meal Planning',
    'page3.description': 'Plan your meals based on what you have in your pantry.',
    'page4.title': 'Receipt Scanning',
    'page4.description': 'Scan receipts to automatically add items to your pantry.',
    'page5.title': 'AI Recipe Generator',
    'page5.description': 'Get personalized recipe suggestions based on your pantry items.',
  },
  about: {
    title: 'About',
    version: 'Version',
    description: 'Nutrion helps you manage your pantry, track food expiration dates, and reduce food waste. Built with care by Solvra Labs.',
    website: 'Website',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    support: 'Contact Support',
    rateApp: 'Rate This App',
    madeWith: 'Made with 💚 by Solvra Labs',
    copyright: '© 2024 Solvra Labs. All rights reserved.',
  },
};

// Initialize i18next with English translations
try {
  console.log('[i18n] Initializing on platform:', Platform.OS);
  
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
      react: {
        useSuspense: false,
      },
      saveMissing: false,
      missingKeyHandler: (lng, ns, key) => {
        console.warn('[i18n] Missing translation key:', key);
      },
    })
    .then(() => {
      console.log('[i18n] Initialized successfully');
    })
    .catch((error: any) => {
      console.error('[i18n] Initialization error:', error?.message || error);
    });
} catch (error: any) {
  console.error('[i18n] Failed to initialize:', error?.message || error);
}

export const changeLanguage = async (languageCode: string) => {
  console.log('[i18n] Language switching disabled - English only');
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
