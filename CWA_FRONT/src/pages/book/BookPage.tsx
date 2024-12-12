import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Tabs, Spin } from 'antd';
import axios from '../../config/axios';
import { API_PATHS } from '../../constants/apiPaths';
import { BookReader } from '../../components/book/BookReader';

interface Book {
  id: number;
  title: string;
  content: string;
  // ... другие поля
}

export const BookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('read');

  const { data: book, isLoading } = useQuery<Book>({
    queryKey: ['book', id],
    queryFn: () => 
      axios.get(API_PATHS.BOOKS.BY_ID(Number(id)))
        .then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return <div>Книга не найдена</div>;
  }

  const items = [
    {
      key: 'read',
      label: 'Читать',
      children: book?.content ? <BookReader content={book.content} /> : null,
    },
    // ... другие табы (информация о книге, комментарии и т.д.)
  ];

  return (
    <div className="p-4">
      <Card title={book.title}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={items}
        />
      </Card>
    </div>
  );
}; 