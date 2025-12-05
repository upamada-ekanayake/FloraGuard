import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: 'en' | 'si') => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-200/80 p-1 rounded-full">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
          language === 'en' ? 'bg-white text-green-700 shadow' : 'text-gray-600 hover:bg-gray-300/50'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('si')}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
          language === 'si' ? 'bg-white text-green-700 shadow' : 'text-gray-600 hover:bg-gray-300/50'
        }`}
      >
        සිංහල
      </button>
    </div>
  );
};
