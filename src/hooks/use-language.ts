'use client';

import { useState, useEffect } from 'react';
import type { Language } from '@/lib/i18n/translations';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved language
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['fr', 'en', 'ln', 'sw'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en') {
        setLanguage('en');
      } else {
        setLanguage('fr'); // Default to French
      }
    }
  }, []);

  const setLanguageMode = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return {
    language,
    setLanguage: setLanguageMode,
    mounted,
  };
}

