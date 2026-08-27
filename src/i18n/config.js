import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

// * Retrieve persisted language preference or default to Arabic
const savedLang = localStorage.getItem('app_lang') || 'ar';

i18n
  .use(HttpApi) // * Fetch JSON files dynamically over HTTP
  .use(initReactI18next) // * Pass i18n instance to react-i18next
  .init({
    lng: savedLang,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // * Dynamic load path from public folder
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;