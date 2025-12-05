import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations, TranslationKey } from '../translations';

type Language = 'en' | 'si';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLang = window.localStorage.getItem('floraGuardLanguage');
      return (savedLang === 'si' || savedLang === 'en') ? savedLang : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('floraGuardLanguage', language);
    } catch (e) {
      console.error("Failed to save language to localStorage", e);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
