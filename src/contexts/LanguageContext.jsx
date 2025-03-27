import React, { createContext, useState, useContext } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationAR from '../locales/ar/translation.json';
import translationES from '../locales/es/translation.json';
import translationDE from '../locales/de/translation.json';
import translationIT from '../locales/it/translation.json';
import translationJA from '../locales/ja/translation.json';
import translationZH from '../locales/zh/translation.json';
import translationPT from '../locales/pt/translation.json';
import translationRU from '../locales/ru/translation.json';

// Configure i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
      ar: { translation: translationAR },
      es: { translation: translationES },
      de: { translation: translationDE },
      it: { translation: translationIT },
      ja: { translation: translationJA },
      zh: { translation: translationZH },
      pt: { translation: translationPT },
      ru: { translation: translationRU }
    },
    lng: localStorage.getItem('language') || 'en', // Default to English or last selected
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('language', lng);
    
    // Set text direction based on language
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.classList.remove('rtl');
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default i18n;