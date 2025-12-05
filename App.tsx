import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { DiagnosisResult } from './components/DiagnosisResult';
import { HistoryPanel } from './components/HistoryPanel';
import { diagnosePlant } from './services/geminiService';
import type { Diagnosis, HistoryItem } from './types';
import { LeafIcon } from './components/icons/LeafIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { useLanguage } from './context/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';

const loadingMessages = {
  en: [
    "Consulting botanical archives...",
    "Analyzing leaf patterns...",
    "Checking for common pests...",
    "Cross-referencing with plant pathology database...",
    "Finalizing diagnosis...",
  ],
  si: [
    "ශාක විද්‍යාත්මක ලේඛනාගාර පරිශීලනය කරමින්...",
    "පත්ර රටා විශ්ලේෂණය කරමින්...",
    "පොදු පළිබෝධකයන් සඳහා පරීක්ෂා කරමින්...",
    "ශාක ව්‍යාධි දත්ත සමුදාය සමඟ සසඳමින්...",
    "රෝග විනිශ්චය අවසන් කරමින්...",
  ]
};

const THUMBNAIL_MAX_WIDTH = 200;
const THUMBNAIL_MAX_HEIGHT = 200;
const THUMBNAIL_QUALITY = 0.7; // JPEG quality

const createThumbnail = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > THUMBNAIL_MAX_WIDTH) {
          height *= THUMBNAIL_MAX_WIDTH / width;
          width = THUMBNAIL_MAX_WIDTH;
        }
      } else {
        if (height > THUMBNAIL_MAX_HEIGHT) {
          width *= THUMBNAIL_MAX_HEIGHT / height;
          height = THUMBNAIL_MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY));
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};


const App: React.FC = () => {
  const { language, t } = useLanguage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[language][0]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentViewId, setCurrentViewId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('floraGuardHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  useEffect(() => {
    const saveHistoryWithAutoPrune = (historyToSave: HistoryItem[]) => {
      if (historyToSave.length === 0) {
        localStorage.removeItem('floraGuardHistory');
        return;
      }
      try {
        localStorage.setItem('floraGuardHistory', JSON.stringify(historyToSave));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || (e.code && (e.code === 22 || e.code === 1014))) {
          console.warn("LocalStorage quota exceeded. Pruning oldest history item.");
          saveHistoryWithAutoPrune(historyToSave.slice(0, -1));
        } else {
          console.error("Failed to save history to localStorage", e);
        }
      }
    };
    saveHistoryWithAutoPrune(history);
  }, [history]);

  useEffect(() => {
    let interval: number;
    const messages = loadingMessages[language];
    if (isLoading) {
      setLoadingMessage(messages[0]); // Reset to first message
      interval = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = messages.indexOf(prev);
          return messages[(currentIndex + 1) % messages.length];
        });
      }, 2500);
    }
    return () => window.clearInterval(interval);
  }, [isLoading, language]);

  const resetCurrentDiagnosis = () => {
    setDiagnosis(null);
    setError(null);
    setRawResponse(null);
    setCurrentViewId(null);
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    resetCurrentDiagnosis();
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    resetCurrentDiagnosis();
  };

  const parseDiagnosis = (text: string): Diagnosis | null => {
    if (text.includes("Please upload a clear photo of a plant leaf.") || text.includes("Great news! This plant looks healthy") || text.includes("කරුණාකර පැහැදිලි ශාක පත්‍රයක ඡායාරූපයක් ატვირთეთ") || text.includes("ශුභ ආරංචියක්! මෙම ශාකය සෞඛ්‍ය සම්පන්නයි")) {
      return null;
    }
  
    const getMatch = (regex: RegExp) => text.match(regex)?.[1]?.trim() || '';

    const status = getMatch(/## .*?\*\*(?:Status|තත්ත්වය):\s*(.*?)\*\*/i);
    let diseaseName = getMatch(/\*\*(?:Disease Name|රෝගයේ නම):\*\*\s*(.*)/i);
    let confidence = getMatch(/\*\*(?:Confidence|විශ්වාසය):\*\*\s*(.*)/i);

    if (!diseaseName) diseaseName = getMatch(/(?:Disease Name|රෝගයේ නම):\s*(.*)/i);
    if (!confidence) confidence = getMatch(/(?:Confidence|විශ්වාසය):\s*(.*)/i);

    const whatISaw = getMatch(/### .*?(?:What I Saw|මා දුටු දේ)\s*([\s\S]*?)(?=###|$)/i);
    const howToFixItOrganic = getMatch(/### .*?(?:How to Fix It \(Organic\)|ප්‍රතිකාර ක්‍රම \(කාබනික\))\s*([\s\S]*?)(?=###|$)/i);
    const prevention = getMatch(/### .*?(?:Prevention Tips|වැළැක්වීමේ උපදෙස්)\s*([\s\S]*?)(?=###|$)/i);
    const detailedCareTips = getMatch(/### .*?(?:Detailed Plant Care|සවිස්තරාත්මක ශාක රැකවරණය)\s*([\s\S]*?)(?=###|$)/i);
    
    if (!status || !diseaseName) {
      console.warn("Could not parse diagnosis from the model's response. Displaying raw response.", text);
      return null;
    }

    const diagnosisResult: Diagnosis = {
      status,
      diseaseName,
      confidence,
      whatISaw,
      howToFixItOrganic,
      prevention,
      detailedCareTips,
    };

    return diagnosisResult;
  };

  const handleDiagnose = useCallback(async () => {
    if (!imageFile || !imagePreview) {
      setError(t('errorUpload'));
      return;
    }

    setIsLoading(true);
    resetCurrentDiagnosis();

    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imageFile.type;
      const responseText = await diagnosePlant(base64Data, mimeType, language);
      const parsed = parseDiagnosis(responseText);

      const thumbnail = await createThumbnail(imagePreview);

      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        image: thumbnail,
        diagnosis: parsed,
        rawResponse: parsed ? null : responseText,
        timestamp: new Date().toISOString(),
      };

      setHistory(prev => [newHistoryItem, ...prev]);
      
      if (parsed) {
        setDiagnosis(parsed);
      } else {
        setRawResponse(responseText);
      }
      setCurrentViewId(newHistoryItem.id);

    } catch (err) {
      console.error(err);
      setError(t('errorDiagnosis'));
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imagePreview, language, t]);

  const handleNewDiagnosis = () => {
    setImageFile(null);
    setImagePreview(null);
    resetCurrentDiagnosis();
  };

  const handleViewHistoryItem = (item: HistoryItem) => {
    setImagePreview(item.image);
    setDiagnosis(item.diagnosis);
    setRawResponse(item.rawResponse);
    setCurrentViewId(item.id);
    setError(null);
    setIsLoading(false);
    setImageFile(null);
  };
  
  const handleClearHistory = () => {
    setHistory([]);
  }

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8 rounded-lg bg-white/50 shadow-md flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-green-800">{t('loadingTitle')}</p>
          <p className="text-green-700 transition-opacity duration-500">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
       return <div className="mt-6 text-center p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">{error}</div>;
    }
    
    if (diagnosis) {
        return <DiagnosisResult diagnosis={diagnosis} />;
    }

    if (rawResponse) {
       return (
            <div className="mt-8 p-6 w-full bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="prose max-w-none">
                  <MarkdownRenderer text={rawResponse} />
                </div>
            </div>
        );
    }
    
    return (
        <>
            <ImageUploader 
                onImageUpload={handleImageUpload} 
                imagePreview={imagePreview}
                onRemoveImage={handleRemoveImage}
            />
            {imagePreview && (
                 <div className="text-center mt-6">
                    <button
                        onClick={handleDiagnose}
                        disabled={!imageFile}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <SparklesIcon className="h-6 w-6" />
                        {t('diagnoseButton')}
                    </button>
                 </div>
            )}
        </>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="w-full mb-8">
            <div className="flex justify-between items-center">
                <div></div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <LeafIcon className="h-10 w-10 text-green-600" />
                        <h1 className="text-4xl sm:text-5xl font-bold text-green-800 tracking-tight">
                        {t('appTitle')}
                        </h1>
                    </div>
                    <p className="text-lg text-green-700">{t('appSubtitle')}</p>
                </div>
                <LanguageSwitcher />
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <main className="lg:col-span-2 space-y-6">
                {renderMainContent()}
                {(diagnosis || rawResponse || error) && !isLoading && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleNewDiagnosis}
                            className="flex items-center mx-auto justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-300"
                        >
                            {t('newDiagnosisButton')}
                        </button>
                    </div>
                )}
            </main>
            <aside className="lg:col-span-1 w-full">
                <HistoryPanel 
                    history={history} 
                    onSelect={handleViewHistoryItem}
                    onClear={handleClearHistory}
                    activeId={currentViewId}
                />
            </aside>
        </div>
        
        <footer className="w-full text-center mt-12 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} FloraGuard. {t('footerText')}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;