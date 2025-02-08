import React, { useEffect } from 'react';

const MetaUpdater = () => {
  const metaTranslations = {
    default: {
      title: "Freezepix Printing App",
      description: "Order photo prints and personalized photo gifts like keychains and 3D crystals with Freezepix. Create memorable keepsakes with our easy-to-use printing app.",
      keywords: "Freezepix, printing app, order photo prints, photo gifts, keychain, 3D crystal, custom printing, personalized gifts",
      lang: "en"
    },
    fr: {
      title: "Application d'impression Freezepix",
      description: "Commandez des tirages photo et des cadeaux photo personnalisés comme des porte-clés et des cristaux 3D avec Freezepix. Créez des souvenirs mémorables avec notre application d'impression facile à utiliser.",
      keywords: "Freezepix, application d'impression, commander des tirages photo, cadeaux photo, porte-clés, cristal 3D, impression personnalisée, cadeaux personnalisés",
      lang: "fr"
    },
    ar: {
      title: "تطبيق Freezepix للطباعة",
      description: "اطلب مطبوعات الصور والهدايا المخصصة مثل سلاسل المفاتيح والكريستال ثلاثي الأبعاد مع Freezepix. قم بإنشاء تذكارات لا تنسى مع تطبيق الطباعة سهل الاستخدام.",
      keywords: "Freezepix، تطبيق طباعة، طلب مطبوعات صور، هدايا صور، سلسلة مفاتيح، كريستال ثلاثي الأبعاد، طباعة مخصصة، هدايا مخصصة",
      lang: "ar"
    }
  };

  useEffect(() => {
    // Get language from URL path
    const path = window.location.pathname;
    let currentLang = 'default';

    if (path.includes('/fr')) {
      currentLang = 'fr';
    } else if (path.includes('/ar')) {
      currentLang = 'ar';
    }

    const meta = metaTranslations[currentLang];

    // Update HTML lang attribute
    document.documentElement.lang = meta.lang;

    // Update title
    document.title = meta.title;

    // Update meta tags
    const updateMetaTag = (selector, attribute, value) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, value);
      }
    };

    // Basic meta tags
    updateMetaTag('meta[name="description"]', 'content', meta.description);
    updateMetaTag('meta[name="keywords"]', 'content', meta.keywords);

    // OpenGraph meta tags
    updateMetaTag('meta[property="og:title"]', 'content', meta.title);
    updateMetaTag('meta[property="og:description"]', 'content', meta.description);

    // Twitter meta tags
    updateMetaTag('meta[name="twitter:title"]', 'content', meta.title);
    updateMetaTag('meta[name="twitter:description"]', 'content', meta.description);

    // Listen for URL changes (optional, for single-page apps)
    const handleUrlChange = () => {
      const newPath = window.location.pathname;
      let newLang = 'default';

      if (newPath.includes('/fr')) {
        newLang = 'fr';
      } else if (newPath.includes('/ar')) {
        newLang = 'ar';
      }

      const newMeta = metaTranslations[newLang];
      document.documentElement.lang = newMeta.lang;
      document.title = newMeta.title;
      updateMetaTag('meta[name="description"]', 'content', newMeta.description);
      updateMetaTag('meta[name="keywords"]', 'content', newMeta.keywords);
      updateMetaTag('meta[property="og:title"]', 'content', newMeta.title);
      updateMetaTag('meta[property="og:description"]', 'content', newMeta.description);
      updateMetaTag('meta[name="twitter:title"]', 'content', newMeta.title);
      updateMetaTag('meta[name="twitter:description"]', 'content', newMeta.description);
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  return null;
};

export default MetaUpdater;