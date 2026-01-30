import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'kn', 'te', 'ta', 'hi'],
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false
    }
  });

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`Failed loading translation: ${lng}`, msg);
});

export default i18n;