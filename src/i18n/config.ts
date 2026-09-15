import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import ar from './ar.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

const defaultLanguage = Localization.getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
