import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../../types/books';
import { API_URL } from '../../constants/apiUrl';
import { createRoot } from 'react-dom/client';

const { Meta } = Card;
const { Text } = Typography;

interface Props {
  book: Book;
}

interface DefaultCoverProps {
  title?: string;
  author?: string;
}

const DefaultCover: React.FC<DefaultCoverProps> = ({ title, author }) => (
  <div className="w-full h-full relative group">
    {/* Градиентный фон */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-90" />
    
    {/* Декоративный паттерн */}
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:20px_20px]" />
    
    {/* Контент */}
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-16 h-16 mb-4 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
        <BookOutlined className="text-3xl text-white" />
      </div>
      
      {title && (
        <div className="text-center">
          <h3 className="font-medium text-lg mb-1 line-clamp-2">{title}</h3>
          {author && (
            <p className="text-sm text-white/80 line-clamp-1">{author}</p>
          )}
        </div>
      )}
      
      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
    
    {/* Анимированная рамка */}
    <div className="absolute inset-4 border border-white/20 rounded-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
  </div>
);

interface BookCardComponent extends React.FC<Props> {
  DefaultCover: React.FC<DefaultCoverProps>;
}

const BookCard: BookCardComponent = ({ book }) => {
  const navigate = useNavigate();

  const renderCover = () => {
    if (!book.imageUrl) {
      return <DefaultCover title={book.title} author={book.author} />;
    }

    return (
      <img
        alt={book.title}
        src={`${API_URL}${book.imageUrl}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          const container = target.parentElement!;
          target.style.display = 'none';
          const defaultCover = document.createElement('div');
          container.appendChild(defaultCover);
          const root = createRoot(defaultCover);
          root.render(<DefaultCover title={book.title} author={book.author} />);
        }}
      />
    );
  };

  return (
    <Card
      hoverable
      cover={
        <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
          {renderCover()}
        </div>
      }
      onClick={() => navigate(`/books/read/${book.id}`)}
      className="h-full"
    >
      <Meta
        title={book.title}
        description={
          <Space direction="vertical" size={2}>
            <Text type="secondary">{book.author}</Text>
            <Space size={[0, 4]} wrap>
              {book.genres?.map((genre) => (
                <Tag key={genre.id} color="blue">
                  {genre.name}
                </Tag>
              ))}
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

BookCard.DefaultCover = DefaultCover;

export default BookCard; 