import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    
    if (newLanguage === 'fr') {
      navigate('/fr');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (isLoaded && language) {
      if (language === 'fr') {
        navigate('/fr');
      } else {
        navigate('/');
      }
    }
  }, [language, navigate, isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="language-selector">
      <select 
        value={language || 'en'} 
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default LanguageSelector;