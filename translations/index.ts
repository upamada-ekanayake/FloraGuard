import { en } from './en';
import { si } from './si';

export const translations = {
  en,
  si,
};

export type TranslationKey = keyof typeof en;
