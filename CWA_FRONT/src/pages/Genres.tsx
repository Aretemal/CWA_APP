import React, { useState } from 'react';
import { Card, Typography, Space, Button, Input, Modal, Form, message, Tooltip, Badge, Progress, Empty, Spin, Statistic } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  BookOutlined,
  BarChartOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenres, useCreateGenre, useDeleteGenre } from '../api/genres';
import type { Genre } from '../types/books';

const { Title, Text } = Typography;

interface GenresProps {
  isAdmin?: boolean;
}

const Genres: React.FC<GenresProps> = ({ isAdmin = false }) => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isStatsModalVisible, setIsStatsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: genres = [], isLoading } = useGenres();
  const createGenre = useCreateGenre();
  const deleteGenre = useDeleteGenre();

  const filteredGenres = genres.filter(genre => 
    genre.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Статистика по жанрам
  const totalBooks = genres.reduce((sum, genre) => sum + (genre.books?.length || 0), 0);
  const mostPopularGenre = genres.reduce((prev, curr) => 
    (curr.books?.length || 0) > (prev.books?.length || 0) ? curr : prev
  , genres[0]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      await createGenre.mutateAsync(values);
      message.success('Жанр успешно создан');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при создании жанра');
    }
  };

  const handleDelete = async (genre: Genre) => {
    try {
      await deleteGenre.mutateAsync(genre.id);
      message.success('Жанр успешно удален');
    } catch (error) {
      message.error('Ошибка при удалении жанра');
    }
  };

  const renderGenreStats = (genre: Genre) => {
    const percentage = totalBooks ? ((genre.books?.length || 0) / totalBooks) * 100 : 0;
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <Text className="text-gray-500">Доля в библиотеке:</Text>
          <Text strong>{percentage.toFixed(1)}%</Text>
        </div>
        <Progress percent={Number(percentage.toFixed(1))} size="small" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-sm p-6">
      {/* Заголовок и статистика */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Title level={3} className="!mb-2">
            {isAdmin ? 'Управление жанрами' : 'Жанры'}
          </Title>
          <Space size="large">
            <Badge count={genres.length} showZero>
              <Text type="secondary">Всего жанров</Text>
            </Badge>
            <Badge count={totalBooks} showZero color="blue">
              <Text type="secondary">Всего книг</Text>
            </Badge>
          </Space>
        </div>
        <Space>
          <Input
            placeholder="Поиск по названию"
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={e => setSearchText(e.target.value)}
            className="w-64"
          />
          {isAdmin && (
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingGenre(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Добавить жанр
            </Button>
          )}
        </Space>
      </div>

      {/* Статистика по жанрам */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <BookOutlined className="text-2xl text-blue-500" />
            <div>
              <Text type="secondary">Самый популярный жанр</Text>
              <div className="font-medium">{mostPopularGenre?.name || 'Нет данных'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BarChartOutlined className="text-2xl text-green-500" />
            <div>
              <Text type="secondary">Среднее книг на жанр</Text>
              <div className="font-medium">
                {genres.length ? (totalBooks / genres.length).toFixed(1) : '0'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-2xl text-purple-500" />
            <div>
              <Text type="secondary">Последнее обновление</Text>
              <div className="font-medium">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Список жанров */}
      {filteredGenres.length === 0 ? (
        <Empty description="Жанры не найдены" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGenres.map(genre => (
              <motion.div
                key={genre.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card 
                  className="hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedGenre(genre);
                    setIsStatsModalVisible(true);
                  }}
                  actions={isAdmin ? [
                    <Tooltip title="Подробная статистика">
                      <InfoCircleOutlined 
                        key="info"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGenre(genre);
                          setIsStatsModalVisible(true);
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="Редактировать">
                      <EditOutlined 
                        key="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGenre(genre);
                          form.setFieldsValue(genre);
                          setIsModalVisible(true);
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="Удалить">
                      <DeleteOutlined 
                        key="delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(genre);
                        }}
                      />
                    </Tooltip>,
                  ] : undefined}
                >
                  <Card.Meta
                    title={
                      <Space>
                        {genre.name}
                        <Badge 
                          count={genre.books?.length || 0} 
                          style={{ backgroundColor: '#52c41a' }}
                        />
                      </Space>
                    }
                    description={
                      <Text type="secondary" className="text-sm">
                        Добавлен: {new Date(genre.createdAt).toLocaleDateString()}
                      </Text>
                    }
                  />
                  {renderGenreStats(genre)}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Модальное окно создания/редактирования */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <BookOutlined className="text-blue-500" />
            <span>{editingGenre ? 'Редактировать жанр' : 'Добавить жанр'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingGenre(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название жанра' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                {editingGenre ? 'Сохранить' : 'Создать'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно статистики */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <BarChartOutlined className="text-green-500" />
            <span>Статистика жанра: {selectedGenre?.name}</span>
          </div>
        }
        open={isStatsModalVisible}
        onCancel={() => {
          setIsStatsModalVisible(false);
          setSelectedGenre(null);
        }}
        footer={null}
      >
        {selectedGenre && (
          <div className="space-y-4">
            <Card className="bg-gray-50">
              <Statistic
                title="Количество книг"
                value={selectedGenre.books?.length || 0}
                prefix={<BookOutlined />}
              />
            </Card>
            
            <Card className="bg-gray-50">
              <Title level={5}>Доля в библиотеке</Title>
              <Progress 
                percent={Number(((selectedGenre.books?.length || 0) / totalBooks * 100).toFixed(1))}
                status="active"
              />
            </Card>

            <Card className="bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Дата создания:</Text>
                  <Text strong>{new Date(selectedGenre.createdAt).toLocaleDateString()}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Последнее обновление:</Text>
                  <Text strong>{new Date(selectedGenre.updatedAt).toLocaleDateString()}</Text>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Genres; 