import React from 'react';
import type { Diagnosis } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useLanguage } from '../context/LanguageContext';

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-2">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-green-900">{title}</h3>
        </div>
        <div className="text-gray-700 space-y-2 prose prose-sm max-w-none prose-p:my-1 prose-ol:my-1 prose-li:my-0.5">
            {children}
        </div>
    </div>
);

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full animate-fade-in space-y-6">
        <header className="text-center p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg">
            <p className="text-lg font-semibold uppercase tracking-wider">{diagnosis.status}</p>
            <h2 className="text-4xl font-bold">{diagnosis.diseaseName}</h2>
            <div className="mt-2 inline-block bg-green-800/50 text-green-100 rounded-full px-3 py-1 text-sm">
                {t('confidence')}: {diagnosis.confidence}
            </div>
        </header>

        <div className="space-y-6">
            <InfoCard title={t('symptomsTitle')} icon={<EyeIcon />}>
                <MarkdownRenderer text={diagnosis.whatISaw} />
            </InfoCard>

            <InfoCard title={t('treatmentTitle')} icon={<TreatmentIcon />}>
                <MarkdownRenderer text={diagnosis.howToFixItOrganic} />
            </InfoCard>

            <InfoCard title={t('preventionTitle')} icon={<ShieldIcon />}>
                <MarkdownRenderer text={diagnosis.prevention} />
            </InfoCard>

            {diagnosis.detailedCareTips && (
                <InfoCard title={t('careTitle')} icon={<PlantCareIcon />}>
                    <MarkdownRenderer text={diagnosis.detailedCareTips} />
                </InfoCard>
            )}
        </div>
    </div>
  );
};

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const TreatmentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M10.25 4a.75.75 0 00-1.5 0V7.25H4.5a.75.75 0 000 1.5h4.25V13a.75.75 0 001.5 0V8.75h4.25a.75.75 0 000-1.5H11.75V4h-1.5z" fill="currentColor"></path>
        <path fillRule="evenodd" d="M8 15.5a5.5 5.5 0 1011 0 5.5 5.5 0 00-11 0zm5.5-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" fill="currentColor"></path>
        <path fillRule="evenodd" d="M2 11.5a5.5 5.5 0 1011 0 5.5 5.5 0 00-11 0zm5.5-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" fill="currentColor"></path>
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const PlantCareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);