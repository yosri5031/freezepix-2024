import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();

  return (
    <div className="language-selector">
      <select 
        value={language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default LanguageSelector; 