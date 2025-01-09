import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { NavLink } from 'react-router-dom';

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  return (
    <div className="language-selector">
      <div className="flex gap-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `cursor-pointer ${isActive && language === 'en' ? 'font-bold' : ''}`
          }
          onClick={() => handleLanguageChange('en')}
        >
          English
        </NavLink>
        <span>|</span>
        <NavLink 
          to="/fr" 
          className={({ isActive }) => 
            `cursor-pointer ${isActive && language === 'fr' ? 'font-bold' : ''}`
          }
          onClick={() => handleLanguageChange('fr')}
        >
          Français
        </NavLink>
      </div>
    </div>
  );
};

export default LanguageSelector;