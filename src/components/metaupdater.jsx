import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MetaTagsManager = () => {
  const location = useLocation();
  
  const metaTranslations = {
    default: {
      title: "Freezepix Printing App",
      description: "Order photo prints and personalized photo gifts like keychains and 3D crystals with Freezepix. Create memorable keepsakes with our easy-to-use printing app.",
      keywords: "Freezepix, printing app, order photo prints, photo gifts, keychain, 3D crystal, custom printing, personalized gifts",
      lang: "en",
      dir: "ltr"
    },
    fr: {
      title: "Application d'impression Freezepix",
      description: "Commandez des tirages photo et des cadeaux photo personnalisés comme des porte-clés et des cristaux 3D avec Freezepix. Créez des souvenirs mémorables avec notre application d'impression facile à utiliser.",
      keywords: "Freezepix, application d'impression, commander des tirages photo, cadeaux photo, porte-clés, cristal 3D, impression personnalisée, cadeaux personnalisés",
      lang: "fr",
      dir: "ltr"
    },
    ar: {
      title: "تطبيق Freezepix للطباعة",
      description: "اطلب مطبوعات الصور والهدايا المخصصة مثل سلاسل المفاتيح والكريستال ثلاثي الأبعاد مع Freezepix. قم بإنشاء تذكارات لا تنسى مع تطبيق الطباعة سهل الاستخدام.",
      keywords: "Freezepix، تطبيق طباعة، طلب مطبوعات صور، هدايا صور، سلسلة مفاتيح، كريستال ثلاثي الأبعاد، طباعة مخصصة، هدايا مخصصة",
      lang: "ar",
      dir: "rtl"
    }
  };

  useEffect(() => {
    // Get current language based on path
    const path = location.pathname;
    let currentLang = 'default';
    
    if (path.includes('/fr')) {
      currentLang = 'fr';
    } else if (path.includes('/TN')) {
      currentLang = 'ar';
    }

    const meta = metaTranslations[currentLang];

    // Update HTML lang and dir attributes
    document.documentElement.lang = meta.lang;
    document.documentElement.dir = meta.dir;

    // Helper function to create or update meta tags
    const updateMetaTag = (options) => {
      const { name, property, content } = options;
      let element = null;

      if (name) {
        element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
      } else if (property) {
        element = document.querySelector(`meta[property="${property}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', property);
          document.head.appendChild(element);
        }
      }

      if (element) {
        element.setAttribute('content', content);
      }
    };

    // Update title
    document.title = meta.title;

    // Update basic meta tags
    updateMetaTag({ name: 'description', content: meta.description });
    updateMetaTag({ name: 'keywords', content: meta.keywords });

    // Update OpenGraph meta tags
    updateMetaTag({ property: 'og:title', content: meta.title });
    updateMetaTag({ property: 'og:description', content: meta.description });
    updateMetaTag({ property: 'og:locale', content: meta.lang });
    updateMetaTag({ property: 'og:url', content: window.location.href });
    updateMetaTag({ property: 'og:type', content: 'website' });

    // Update Twitter meta tags
    updateMetaTag({ name: 'twitter:card', content: 'summary_large_image' });
    updateMetaTag({ name: 'twitter:title', content: meta.title });
    updateMetaTag({ name: 'twitter:description', content: meta.description });

    // Add canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', window.location.href);

    // Add alternate language links
    const alternates = {
      default: '/',
      fr: '/fr',
      ar: '/TN'
    };

    Object.entries(metaTranslations).forEach(([key, value]) => {
      const href = `${window.location.origin}${alternates[key]}`;
      let altElement = document.querySelector(`link[hreflang="${value.lang}"]`);
      
      if (!altElement) {
        altElement = document.createElement('link');
        altElement.setAttribute('rel', 'alternate');
        altElement.setAttribute('hreflang', value.lang);
        document.head.appendChild(altElement);
      }
      
      altElement.setAttribute('href', href);
    });

  }, [location]);

  return null;
};

export default MetaTagsManager;