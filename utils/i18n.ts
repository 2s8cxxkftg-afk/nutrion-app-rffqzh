
// Simplified i18n - English only
// Translation infrastructure removed per user request

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

// Dummy i18n object for compatibility
const i18n = {
  language: 'en',
  changeLanguage: changeLanguage,
  t: (key: string) => key, // Return key as fallback
};

export default i18n;
