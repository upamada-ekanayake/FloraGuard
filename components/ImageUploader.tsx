import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { useLanguage } from '../context/LanguageContext';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
  onRemoveImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreview, onRemoveImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div 
        className={`w-full p-4 border-4 ${isDragging ? 'border-green-500 bg-green-100/50' : 'border-dashed border-green-300'} rounded-2xl transition-all duration-300 text-center relative aspect-video flex items-center justify-center`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
        />
        {imagePreview ? (
          <>
            <img src={imagePreview} alt={t('imageAlt')} className="w-full h-full object-contain rounded-lg" />
            <button
              onClick={onRemoveImage}
              className="absolute top-2 right-2 bg-white/70 text-gray-800 rounded-full p-2 hover:bg-white shadow-md transition-all"
              aria-label={t('removeImage')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-green-700">
            <UploadIcon className="h-16 w-16 mb-4 text-green-500" />
            <span className="font-semibold text-lg">{t('uploadTitle')}</span>
            <span className="text-sm">{t('uploadSubtitle')}</span>
          </label>
        )}
      </div>
    </div>
  );
};