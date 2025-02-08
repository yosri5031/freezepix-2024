import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const languages = [
    { code: 'en', label: 'English', path: '/' },
    { code: 'fr', label: 'Français', path: '/fr' },
    { code: 'ar', label: 'العربية', path: '/ar' }
  ];

  useEffect(() => {
    // Update meta tags when language changes
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
          {languages.find(l => l.code === language)?.label}
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
                <span>{lang.label}</span>
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