import React, { useState } from 'react';
import { Select, Button, Space, message, Spin } from 'antd';
import { TranslationOutlined } from '@ant-design/icons';
import { useTranslation, LANGUAGES } from '../../hooks/useTranslation';

interface Props {
  content: string;
}

export const BookReader: React.FC<Props> = ({ content }) => {
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('ru');
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const { translate, isLoading, error } = useTranslation();

  const paragraphs = content.split('\n\n').filter(p => p.trim());

  const handleTranslate = async (text: string) => {
    try {
      const translated = await translate(text, sourceLang, targetLang);
      setTranslatedContent(translated);
    } catch (error) {
      message.error('Не удалось перевести текст');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
        <Space>
          <div className="flex items-center gap-2">
            <span>С:</span>
            <Select
              value={sourceLang}
              onChange={setSourceLang}
              style={{ width: 120 }}
              options={LANGUAGES.map(lang => ({
                value: lang.code,
                label: lang.name,
              }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>На:</span>
            <Select
              value={targetLang}
              onChange={setTargetLang}
              style={{ width: 120 }}
              options={LANGUAGES.map(lang => ({
                value: lang.code,
                label: lang.name,
              }))}
            />
          </div>
        </Space>
      </div>

      <div className="flex-1 overflow-auto">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="mb-6 group">
            <div className="text-gray-800 mb-2 text-base leading-relaxed">
              {paragraph}
            </div>

            <Button
              size="small"
              icon={<TranslationOutlined />}
              onClick={() => handleTranslate(paragraph)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Перевести
            </Button>

            {isLoading && index === paragraphs.indexOf(paragraph) && (
              <div className="mt-2">
                <Spin size="small" />
              </div>
            )}
            {translatedContent && index === paragraphs.indexOf(paragraph) && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-base leading-relaxed">
                {translatedContent}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 