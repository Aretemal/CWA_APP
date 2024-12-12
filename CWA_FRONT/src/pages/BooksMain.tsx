import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Typography, Card, Button, Input, Empty, Spin, Tag, Tooltip, Select, Badge, Statistic } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOutlined, 
  PlusOutlined, 
  ReadOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TagOutlined,
  TagsFilled
} from '@ant-design/icons';
import { useMyBooks, useBookCover } from '../api/books';
import { useGenres } from '../api/genres';
import { debounce } from 'lodash';
import type { Book } from '../types/books';
import { API_URL } from '../constants/apiUrl';
import { convertImageToBase64 } from '../utils/image';
import { API_PATHS } from '../constants/apiPaths';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Search } = Input;

const DefaultBookCover: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
    <BookOutlined className="text-6xl text-gray-600/50" />
  </div>
);

const BooksMain: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [bookCovers, setBookCovers] = useState<Record<number, string>>({});
  
  const { data: books = [], isLoading: booksLoading } = useMyBooks();
  const { data: genres = [], isLoading: genresLoading } = useGenres();

  // Фильтрация и сортировка книг
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        const matchesSearch = searchText.toLowerCase().split(' ').every(word =>
          book.title.toLowerCase().includes(word) ||
          book.author.toLowerCase().includes(word)
        );
        const matchesGenre = !selectedGenre || book.genres?.some(g => g.name === selectedGenre);
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.title.localeCompare(b.title);
      });
  }, [books, searchText, selectedGenre, sortBy]);

  const loadBookCover = async (book: Book) => {
    if (!book.imageUrl) return;
    
    try {
      const imageUrl = `${API_URL}${book.imageUrl}`;
      const base64Image = await convertImageToBase64(imageUrl);
      setBookCovers(prev => ({
        ...prev,
        [book.id]: base64Image
      }));
    } catch (error) {
      console.error('Error loading book cover:', error);
    }
  };

  // Загружаем обложки при изменении списка книг
  useEffect(() => {
    filteredBooks.forEach(book => {
      loadBookCover(book);
    });
  }, [filteredBooks]);

  const getBookCoverUrl = (bookId: number) => {
    return `${API_URL}${API_PATHS.BOOKS.COVER(bookId)}`;
  };

  const BookCover: React.FC<{ bookId: number }> = ({ bookId }) => {
    const { data: coverUrl, isLoading } = useBookCover(bookId);

    if (isLoading) {
      return <DefaultBookCover />;
    }

    return (
      <img
        alt="Обложка книги"
        src={coverUrl || '/images/default-book-cover.jpg'}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/images/default-book-cover.jpg';
        }}
      />
    );
  };

  return (
    <Content className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Заголовок и кнопка добавления */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
              <BookOutlined className="text-2xl text-white" />
            </div>
            <Title level={2} className="!mb-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Моя библиотека
            </Title>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/create-book')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 border-0 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-blue-600 hover:to-indigo-600"
          >
            Добавить книгу
          </Button>
        </div>

        {/* Фильтры */}
        <Card className="mb-8 shadow-lg border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <Search
              placeholder="Поиск по названию или автору..."
              size="large"
              allowClear
              onChange={debounce((e) => setSearchText(e.target.value), 300)}
              className="md:w-96"
            />
            <Select
              placeholder="Фильтр по жанру"
              size="large"
              allowClear
              loading={genresLoading}
              options={genres.map(genre => ({
                label: genre.name,
                value: genre.name,
              }))}
              onChange={setSelectedGenre}
              className="md:w-48"
            />
            <Select
              value={sortBy}
              size="large"
              onChange={setSortBy}
              options={[
                { label: 'По дате добавления', value: 'date' },
                { label: 'По названию', value: 'title' },
              ]}
              className="md:w-48"
            />
          </div>
        </Card>

        {/* Список книг */}
        {booksLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Spin size="large" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] bg-white/80 backdrop-blur-sm rounded-2xl">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text className="text-lg text-gray-500">
                  {searchText ? "Книги не найдены" : "Нет книг"}
                </Text>
              }
            />
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/create-book')}
              className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500"
            >
              Добавить книгу
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => {
                console.log(bookCovers[book.id])
                return (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group"
                  >
                    <Card
                      hoverable
                      className="h-full overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
                      bodyStyle={{ padding: 0 }}
                      cover={
                        <div className="relative h-[400px] overflow-hidden">
                          {book.imageUrl ? (
                            <BookCover bookId={book.id} />
                          ) : (
                            <DefaultBookCover />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Title level={4} className="!mb-2 !text-white line-clamp-2">
                                {book.title}
                              </Title>
                              <Text className="text-gray-300 block mb-4">
                                {book.author}
                              </Text>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {book.genres?.map(genre => (
                                  <Tag 
                                    key={genre.id}
                                    className="bg-white/20 border-0 text-white backdrop-blur-sm"
                                  >
                                    {genre.name}
                                  </Tag>
                                ))}
                              </div>
                              <Button
                                type="primary"
                                size="large"
                                icon={<ReadOutlined />}
                                onClick={() => navigate(`/books/read/${book.id}`)}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 border-0 shadow-lg"
                              >
                                Читать
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      }
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </Content>
  );
};

export default BooksMain;