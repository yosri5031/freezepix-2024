import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationAR from '../locales/ar/translation.json';

// Configure i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
      ar: { translation: translationAR }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const location = useLocation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    // Set Arabic language if accessing through /ar route
    if (location.pathname.startsWith('/ar')) {
      i18n.changeLanguage('ar');
      setLanguage('ar');
      localStorage.setItem('language', 'ar');
      document.documentElement.dir = 'rtl';
    }
  }, [location.pathname]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default i18n;