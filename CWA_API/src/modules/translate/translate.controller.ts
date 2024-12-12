import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';
const MAX_CHUNK_LENGTH = 450; // Оставляем запас от лимита в 500

// Карта соответствия языков
const LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  ru: 'ru',
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
  pl: 'pl',
};

@Controller('translate')
export class TranslateController {
  private splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    // Разбиваем текст на предложения (грубо)
    const sentences = text.split(/([.!?]+\s+)/);

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // Если предложение длиннее максимального размера, разбиваем по словам
        if (sentence.length > MAX_CHUNK_LENGTH) {
          const words = sentence.split(/\s+/);
          let wordChunk = '';
          for (const word of words) {
            if ((wordChunk + ' ' + word).length > MAX_CHUNK_LENGTH) {
              chunks.push(wordChunk.trim());
              wordChunk = word;
            } else {
              wordChunk += (wordChunk ? ' ' : '') + word;
            }
          }
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  @Post()
  async translate(
    @Body() data: { text: string; source: string; target: string },
  ) {
    try {
      const sourceLanguage = LANGUAGE_MAP[data.source] || 'en';
      const targetLanguage = LANGUAGE_MAP[data.target] || 'en';
      const chunks = this.splitTextIntoChunks(data.text);

      const translations = await Promise.all(
        chunks.map(async (chunk) => {
          const response = await axios.get(MYMEMORY_API_URL, {
            params: {
              q: chunk,
              langpair: `${sourceLanguage}|${targetLanguage}`,
            },
          });

          if (response.data.responseStatus === 200) {
            return response.data.responseData.translatedText;
          } else {
            throw new Error(response.data.responseDetails);
          }
        }),
      );

      return {
        translatedText: translations.join(' '),
      };
    } catch (error) {
      console.error('Translation error:', error.message);
      throw new HttpException(
        'Failed to translate text',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
