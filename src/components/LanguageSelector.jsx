import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { NavLink, useLocation } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Add this import

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { t } = useTranslation(); // Add this hook

  const languages = [
    { code: 'en', label: t('languages.english'), path: '/' },
    { code: 'fr', label: t('languages.french'), path: '/fr' },
    { code: 'ar', label: t('languages.arabic'), path: '/ar' }
  ];

  const handleLanguageChange = (newLanguage, path) => {
    changeLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm font-medium">
          {t(`languages.${language}`)}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <ul className="py-1">
            {languages.map((lang) => (
              <NavLink
                key={lang.code}
                to={lang.path}
                onClick={() => handleLanguageChange(lang.code)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100
                   ${isActive && language === lang.code ? 'bg-gray-50' : ''}`
                }
              >
                <span>{t(`languages.${lang.code}`)}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </NavLink>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;