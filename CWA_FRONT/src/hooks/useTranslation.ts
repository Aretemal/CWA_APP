import { useState, useCallback } from 'react';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pl', name: 'Polski' },
] as const;

export const useTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(async (text: string, sourceLang: string, targetLang: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(API_PATHS.TRANSLATE, {
        text,
        source: sourceLang,
        target: targetLang,
      });

      return response.data.translatedText;
    } catch (err) {
      setError('Failed to translate text');
      console.error('Translation error:', err);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { translate, isLoading, error, supportedLanguages: LANGUAGES };
}; 