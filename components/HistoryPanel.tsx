import React from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useLanguage } from '../context/LanguageContext';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  activeId: number | null;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear, activeId }) => {
  const { language, t } = useLanguage();
    
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'si' ? 'si-LK' : 'en-US';
    return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-lg p-4 h-full sticky top-8">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
                <HistoryIcon className="h-6 w-6 text-green-700" />
                <h2 className="text-xl font-bold text-green-800">{t('historyTitle')}</h2>
            </div>
            {history.length > 0 && (
                 <button 
                    onClick={onClear} 
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    aria-label={t('clearHistory')}
                >
                    <TrashIcon className="h-5 w-5" />
                 </button>
            )}
        </div>
        
        {history.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                <p>{t('noHistory')}</p>
                <p className="text-sm">{t('noHistorySubtitle')}</p>
            </div>
        ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {history.map(item => (
                    <li key={item.id}>
                        <button 
                           onClick={() => onSelect(item)}
                           className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors duration-200 ${activeId === item.id ? 'bg-green-100 ring-2 ring-green-500' : 'hover:bg-gray-100'}`}
                        >
                           <img src={item.image} alt="Plant preview" className="w-14 h-14 object-cover rounded-md flex-shrink-0 bg-gray-200" />
                           <div className="flex-grow overflow-hidden">
                               <p className="font-semibold text-gray-800 truncate">
                                   {item.diagnosis?.diseaseName || item.rawResponse || t('diagnosis')}
                               </p>
                               <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                           </div>
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
  );
};