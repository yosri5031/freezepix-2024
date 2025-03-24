import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';

const metaTranslations = {
  en: {
    title: "Freezepix Printing App",
    description: "Order photo prints and personalized photo gifts like keychains and 3D crystals with Freezepix. Create memorable keepsakes with our easy-to-use printing app.",
    keywords: "Freezepix, printing app, order photo prints, photo gifts, keychain, 3D crystal, custom printing, personalized gifts"
  },
  fr: {
    title: "Application d'impression Freezepix",
    description: "Commandez des tirages photo et des cadeaux photo personnalisés comme des porte-clés et des cristaux 3D avec Freezepix. Créez des souvenirs mémorables avec notre application d'impression facile à utiliser.",
    keywords: "Freezepix, application d'impression, commander des tirages photo, cadeaux photo, porte-clés, cristal 3D, impression personnalisée, cadeaux personnalisés"
  },
  ar: {
    title: "تطبيق Freezepix للطباعة",
    description: "اطلب مطبوعات الصور والهدايا المخصصة مثل سلاسل المفاتيح والكريستال ثلاثي الأبعاد مع Freezepix. قم بإنشاء تذكارات لا تنسى مع تطبيق الطباعة سهل الاستخدام.",
    keywords: "Freezepix، تطبيق طباعة، طلب مطبوعات صور، هدايا صور، سلسلة مفاتيح، كريستال ثلاثي الأبعاد، طباعة مخصصة، هدايا مخصصة"
  }
};

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', path: '/' },
    { code: 'fr', label: 'Français', path: '/fr' },
    { code: 'ar', label: 'العربية', path: '/TN' }
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Only add the listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update meta tags when language changes
  useEffect(() => {
    const meta = metaTranslations[language];
    if (meta) {
      document.title = meta.title;
      
      // Update meta description
      const descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', meta.description);
      }

      // Update meta keywords
      const keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (keywordsMeta) {
        keywordsMeta.setAttribute('content', meta.keywords);
      }

      // Update OpenGraph meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', meta.title);
      }
      if (ogDescription) {
        ogDescription.setAttribute('content', meta.description);
      }

      // Update Twitter meta tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', meta.title);
      }
      if (twitterDescription) {
        twitterDescription.setAttribute('content', meta.description);
      }
    }
  }, [language]);

  // Toggle dropdown function
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle dropdown called, current state:", isOpen);
    setIsOpen(prevState => !prevState);
  };

  const handleLanguageChange = (newLanguage, path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log(`Language change: ${newLanguage}, path: ${path}`);
    // First change the language
    changeLanguage(newLanguage);
    
    // Then navigate to the appropriate path
    navigate(path);
    
    // Close the dropdown after a small delay
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  // Add a current language debug message
  console.log("Current language:", language);
  console.log("Is dropdown open:", isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        <span className="text-sm font-medium">
          {languages.find(l => l.code === language)?.label || 'Select Language'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <ul className="py-1">
            {languages.map((lang) => (
              <li
                key={lang.code}
                className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${language === lang.code ? 'bg-gray-50' : ''}`}
                onClick={(e) => handleLanguageChange(lang.code, lang.path, e)}
              >
                <span>{lang.label}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;