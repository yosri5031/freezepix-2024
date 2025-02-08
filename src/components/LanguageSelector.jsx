// LanguageSelector.jsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { NavLink, useLocation } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Force component to update when language changes
  React.useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render
      setState(prev => !prev);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const [state, setState] = React.useState(false);

  const getCurrentLanguageLabel = (code) => {
    switch(code) {
      case 'en':
        return 'English';
      case 'fr':
        return 'Français';
      case 'ar':
        return 'العربية';
      default:
        return 'English';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm font-medium">
          {getCurrentLanguageLabel(language)}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <ul className="py-1">
            <NavLink
              to="/"
              onClick={() => {
                handleLanguageChange('en');
                setIsOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100
                 ${language === 'en' ? 'bg-gray-50' : ''}`
              }
            >
              <span>English</span>
              {language === 'en' && <Check className="w-4 h-4 text-blue-500" />}
            </NavLink>
            <NavLink
              to="/fr"
              onClick={() => {
                handleLanguageChange('fr');
                setIsOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100
                 ${language === 'fr' ? 'bg-gray-50' : ''}`
              }
            >
              <span>Français</span>
              {language === 'fr' && <Check className="w-4 h-4 text-blue-500" />}
            </NavLink>
            <NavLink
              to="/ar"
              onClick={() => {
                handleLanguageChange('ar');
                setIsOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100
                 ${language === 'ar' ? 'bg-gray-50' : ''}`
              }
            >
              <span>العربية</span>
              {language === 'ar' && <Check className="w-4 h-4 text-blue-500" />}
            </NavLink>
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(LanguageSelector);