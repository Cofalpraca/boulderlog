import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pl from './locales/pl.json';

const STORAGE_KEY = 'boulderlog_lang';

// Detect browser language
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'pl'].includes(browserLang) ? browserLang : 'en';
};

// Get stored language or detect from browser
const getInitialLanguage = (): string => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['en', 'pl'].includes(stored)) {
    return stored;
  }
  return getBrowserLanguage();
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Persist language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
