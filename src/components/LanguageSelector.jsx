import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Globe } from 'lucide-react';

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
  },
  // New language translations
  es: {
    title: "Aplicación de impresión Freezepix",
    description: "Pide impresiones de fotos y regalos personalizados como llaveros y cristales 3D con Freezepix. Crea recuerdos memorables con nuestra aplicación de impresión fácil de usar.",
    keywords: "Freezepix, aplicación de impresión, pedir impresiones de fotos, regalos fotográficos, llavero, cristal 3D, impresión personalizada, regalos personalizados"
  },
  de: {
    title: "Freezepix Druck-App",
    description: "Bestellen Sie Fotoabzüge und personalisierte Fotogeschenke wie Schlüsselanhänger und 3D-Kristalle mit Freezepix. Erstellen Sie unvergessliche Erinnerungsstücke mit unserer benutzerfreundlichen Druck-App.",
    keywords: "Freezepix, Druck-App, Fotoabzüge bestellen, Fotogeschenke, Schlüsselanhänger, 3D-Kristall, individueller Druck, personalisierte Geschenke"
  },
  it: {
    title: "App di stampa Freezepix",
    description: "Ordina stampe fotografiche e regali personalizzati come portachiavi e cristalli 3D con Freezepix. Crea ricordi indimenticabili con la nostra app di stampa facile da usare.",
    keywords: "Freezepix, app di stampa, ordina stampe fotografiche, regali fotografici, portachiavi, cristallo 3D, stampa personalizzata, regali personalizzati"
  },
  ja: {
    title: "Freezepix 印刷アプリ",
    description: "Freezepixで写真プリントやキーホルダー、3Dクリスタルなどのパーソナライズされた写真ギフトを注文しましょう。使いやすい印刷アプリで思い出に残るキープセイクを作成できます。",
    keywords: "Freezepix、印刷アプリ、写真プリント注文、フォトギフト、キーホルダー、3Dクリスタル、カスタム印刷、パーソナライズギフト"
  },
  zh: {
    title: "Freezepix 打印应用",
    description: "使用 Freezepix 订购照片打印和个性化照片礼品，如钥匙扣和 3D 水晶。使用我们易于使用的打印应用创建难忘的纪念品。",
    keywords: "Freezepix，打印应用，订购照片打印，照片礼品，钥匙扣，3D水晶，定制打印，个性化礼品"
  },
  pt: {
    title: "Aplicativo de impressão Freezepix",
    description: "Encomende impressões de fotos e presentes personalizados como chaveiros e cristais 3D com Freezepix. Crie lembranças memoráveis com nosso aplicativo de impressão fácil de usar.",
    keywords: "Freezepix, aplicativo de impressão, encomendar impressões de fotos, presentes com fotos, chaveiro, cristal 3D, impressão personalizada, presentes personalizados"
  },
  ru: {
    title: "Приложение для печати Freezepix",
    description: "Заказывайте фотопечать и персонализированные фотоподарки, такие как брелоки и 3D-кристаллы с Freezepix. Создавайте запоминающиеся сувениры с помощью нашего простого в использовании приложения для печати.",
    keywords: "Freezepix, приложение для печати, заказ фотопечати, фотоподарки, брелок, 3D-кристалл, индивидуальная печать, персонализированные подарки"
  }
};

const LanguageSelector = ({ isIntro = false}) => { 
    const { changeLanguage, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Expanded languages array with more options
  const languages = [
    { code: 'en', label: 'English', path: '/' },
    { code: 'fr', label: 'Français', path: '/fr' },
    { code: 'ar', label: 'العربية', path: '/TN' },
    // Added languages
    { code: 'es', label: 'Español', path: '/es' },
    { code: 'de', label: 'Deutsch', path: '/de' },
    { code: 'it', label: 'Italiano', path: '/it' },
    { code: 'ja', label: '日本語', path: '/ja' },
    { code: 'zh', label: '中文', path: '/zh' },
    { code: 'pt', label: 'Português', path: '/pt' },
    { code: 'ru', label: 'Русский', path: '/ru' }
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (newLanguage, path) => {
    // First change the language
    changeLanguage(newLanguage);
    
    // Then navigate to the appropriate path
    navigate(path);
    
    // Close the dropdown
    setIsOpen(false);
  };

  return (
    <div className={`relative ${isIntro ? 'w-full' : 'inline-block'} text-left z-50`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`
          flex items-center gap-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-yellow-400
          ${isIntro 
            ? 'w-full h-11 px-3 py-2 justify-between' 
            : 'px-2 py-1 text-sm'
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          <Globe className={`text-gray-500 ${isIntro ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <span className="text-sm font-medium">
            {languages.find(l => l.code === language)?.label || 'Select Language'}
          </span>
        </div>
        <ChevronDown className={`text-gray-500 ${isIntro ? 'w-5 h-5' : 'w-4 h-4'}`} />
      </button>
  
      {isOpen && (
        <div 
          className={`
            absolute rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50 max-h-80 overflow-y-auto
            ${isIntro 
              ? 'top-full left-0 right-0 mt-1 w-full' 
              : 'bottom-full right-0 mb-2 w-56 origin-bottom-right'
            }
          `}
          style={{ 
            pointerEvents: 'auto',
            visibility: 'visible',
            opacity: 1,
            direction: 'ltr'
          }}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`
                  group flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900
                  ${language === lang.code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                `}
                role="menuitem"
                onClick={() => handleLanguageChange(lang.code, lang.path)}
              >
                <span>{lang.label}</span>
                {language === lang.code && (
                  <Check className={`${isIntro ? 'text-yellow-400' : 'text-blue-500'} w-4 h-4`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
