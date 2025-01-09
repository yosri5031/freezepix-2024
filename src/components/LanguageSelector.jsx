import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();
  const navigate = useNavigate();

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    
    // Redirect to the appropriate route based on the selected language
    if (newLanguage === 'fr') {
      navigate('/fr'); // Redirect to French home
    } else {
      navigate('/'); // Redirect to English home
    }
  };

  // Optional: If you want to update the URL when the component mounts
  useEffect(() => {
    if (language === 'fr') {
      navigate('/fr');
    } else {
      navigate('/');
    }
  }, [language, navigate]);

  return (
    <div className="language-selector">
      <select 
        value={language} 
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