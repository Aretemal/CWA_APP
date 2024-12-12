import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Empty, Spin, Row, Col, Input, Select, Space, Button } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useBooks, useBookCover } from '../api/books';
import { useGenres } from '../api/genres';
import { useUserStats } from '../api/users';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import type { Book } from '../types/books';
import type { AppUser } from '../types/user';
import { getUserData } from '../redux/slices/user/userSelectors';
import type { Genre } from '../types/genres';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

const DefaultBookCover: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
    <BookOutlined className="text-6xl text-gray-600/50" />
  </div>
);

const BookCover: React.FC<{ bookId: number }> = ({ bookId }) => {
  const { data: coverUrl, isLoading } = useBookCover(bookId);

  if (isLoading) {
    return <DefaultBookCover />;
  }

  return (
    <div className="aspect-[3/4] h-[300px]">
      <img
        alt="Обложка книги"
        src={coverUrl || '/images/default-book-cover.jpg'}
        className="w-full h-full object-cover rounded-t-lg"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/images/default-book-cover.jpg';
        }}
      />
    </div>
  );
};

// Используем более простой тип для жанра в контексте книги
type BookGenre = {
  id: number;
  name: string;
};

const calculateBookWeight = (book: Book, userData: AppUser | null, userStats: { 
  genreStats: { 
    id: number; 
    count: number;
    bookmarkCount: number; 
  }[];
  authorStats: {
    name: string;
    count: number;
    bookmarkCount: number;
  }[];
}) => {
  let weight = 0;

  // Базовый вес
  weight += 1;

  if (!userData || !book.genres) return weight;

  // Анализ жанров
  book.genres.forEach((bookGenre: BookGenre) => {
    const genreStat = userStats.genreStats.find(stat => stat.id === bookGenre.id);
    if (genreStat) {
      // Вес за загруженные книги этого жанра
      weight += Math.min(genreStat.count * 2, 6);
      
      // Дополнительный вес за закладки в книгах этого жанра
      weight += Math.min(genreStat.bookmarkCount, 4);
    }
  });

  // Анализ автора
  const authorStat = userStats.authorStats.find(stat => stat.name === book.author);
  if (authorStat) {
    // Вес за загруженные книги этого автора
    weight += Math.min(authorStat.count * 3, 9); // Максимум 9 баллов за количество
    
    // Дополнительный вес за закладки в книгах этого автора
    weight += Math.min(authorStat.bookmarkCount * 2, 6); // Максимум 6 баллов за закладки
  }

  // Новизна (небольшой бонус для новых книг)
  const daysSinceCreation = (Date.now() - new Date(book.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 30) { // Для книг младше месяца
    weight += Math.max(0, 2 - (daysSinceCreation / 15)); // Максимум 2 балла за новизну
  }

  return weight;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const userData = useSelector(getUserData);

  const { data: books = [], isLoading } = useBooks(selectedGenres);
  const { data: genres = [], isLoading: genresLoading } = useGenres();
  const { data: userStats } = useUserStats();

  // Добавим логирование после получения данных
  useEffect(() => {
    if (books.length > 0) {
      console.log('Received books:', books);
    }
  }, [books]);

  // Обработчик поиска с debounce
  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
  }, 500);

  // Фильтрация книг
  const filteredBooks = books.filter(book => {
    const matchesSearch = searchQuery ? 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  // Сортировка книг
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'recommended':
        // Применяем веса только для рекомендаций и только если есть userStats
        if (userStats) {
          const weightA = calculateBookWeight(a, userData, userStats);
          const weightB = calculateBookWeight(b, userData, userStats);
          return weightB - weightA;
        }
        // Если нет статистики, сортируем по дате
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <Content className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Заголовок и фильтры */}
        <div className="mb-8">
          <Title level={2} className="mb-6">Библиотека книг</Title>
          
          <Space direction="vertical" className="w-full" size="middle">
            <Search
              placeholder="Поиск по названию или автору"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onChange={e => handleSearch(e.target.value)}
              className="max-w-xl"
            />
            
            <Space wrap>
              <Select
                mode="multiple"
                placeholder="Выберите жанры"
                loading={genresLoading}
                onChange={setSelectedGenres}
                style={{ minWidth: 200 }}
                allowClear
              >
                {genres.map(genre => (
                  <Option key={genre.id} value={genre.id}>
                    {genre.name}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Сортировка"
                onChange={setSortBy}
                defaultValue="recommended"
                style={{ minWidth: 150 }}
              >
                <Option value="recommended">Рекомендуемые</Option>
                <Option value="newest">Сначала новые</Option>
                <Option value="title">По названию</Option>
                <Option value="author">По автору</Option>
              </Select>
            </Space>
          </Space>
        </div>

        {/* Список книг */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : sortedBooks.length === 0 ? (
          <Empty description="Книги не найдены" />
        ) : (
          <Row gutter={[24, 24]}>
            {sortedBooks.map((book) => (
              <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    hoverable
                    cover={<BookCover bookId={book.id} />}
                    onClick={() => navigate(`/books/read/${book.id}`)}
                    className="w-full h-[450px]"
                    bodyStyle={{ 
                      height: '150px',
                      overflow: 'hidden'
                    }}
                  >
                    <Card.Meta
                      title={
                        <div className="text-lg font-medium truncate">
                          {book.title}
                        </div>
                      }
                      description={
                        <div className="h-[80px] overflow-hidden">
                          <Text type="secondary" className="block truncate">
                            {book.author}
                          </Text>
                          <div className="mt-2 overflow-hidden">
                            {book.genres?.map((genre) => (
                              <Text 
                                key={genre.id} 
                                type="secondary" 
                                className="inline-block mr-2 mb-1 text-xs"
                              >
                                #{genre.name}
                              </Text>
                            ))}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </motion.div>
    </Content>
  );
};

export default Home; 