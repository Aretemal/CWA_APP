import React, { useState, useMemo } from 'react';
import { Layout, Typography, Spin, Empty, Card, Button, Tag, Input, Select, Tooltip, Badge, message, Modal, Form, ColorPicker } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOutlined, 
  ReadOutlined, 
  SearchOutlined, 
  FilterOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAllBookmarks, useDeleteBookmark, useUpdateBookmark } from '../api/bookmarks';
import type { Bookmark } from '../api/bookmarks';
import { debounce } from 'lodash';

interface ColorResult {
  metaColor: {
    r: number;
    g: number;
    b: number;
  };
}

const { Title, Text } = Typography;
const { Content } = Layout;
const { Search } = Input;

const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const { data: bookmarks = [], isLoading } = useAllBookmarks();
  const deleteBookmark = useDeleteBookmark();
  const updateBookmark = useUpdateBookmark();

  const [searchText, setSearchText] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'page'>('date');
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Получаем уникальные книги для фильтра
  const books = useMemo(() => {
    const uniqueBooks = new Set(bookmarks.map(b => b.book.title));
    return Array.from(uniqueBooks).map(title => ({
      label: title,
      value: title,
    }));
  }, [bookmarks]);

  // Фильтруем и сортируем закладки
  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter(bookmark => {
        const matchesSearch = searchText.toLowerCase().split(' ').every(word =>
          bookmark.title.toLowerCase().includes(word) ||
          bookmark.note?.toLowerCase().includes(word) ||
          bookmark.book.title.toLowerCase().includes(word)
        );
        const matchesBook = !selectedBook || bookmark.book.title === selectedBook;
        return matchesSearch && matchesBook;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.pageNumber - b.pageNumber;
      });
  }, [bookmarks, searchText, selectedBook, sortBy]);

  const handleDeleteBookmark = async (id: number) => {
    try {
      await deleteBookmark.mutateAsync(id);
    } catch (error) {
      message.error('Ошибка при удалении закладки');
    }
  };

  // Обработчик редактирования
  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    form.setFieldsValue({
      title: bookmark.title,
      note: bookmark.note,
      color: bookmark.color,
    });
    setIsEditModalVisible(true);
  };

  // Обработчик сохранения изменений
  const handleUpdateBookmark = async (values: { title: string; note?: string; color: any }) => {
    if (!editingBookmark) return;

    const color = values.color as unknown as ColorResult;
    const hexColor = color?.metaColor ? 
      `#${[color.metaColor.r, color.metaColor.g, color.metaColor.b]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')}` : 
      editingBookmark.color || '#3B82F6';

    try {
      await updateBookmark.mutateAsync({
        id: editingBookmark.id,
        title: values.title,
        note: values.note,
        color: hexColor,
      });
      setIsEditModalVisible(false);
      setEditingBookmark(null);
      form.resetFields();
      message.success('Закладка обновлена');
    } catch (error) {
      message.error('Ошибка при обновлении закладки');
    }
  };

  return (
    <Content className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BookOutlined className="text-2xl text-blue-500" />
            <Title level={2} className="!mb-0">
              Мои закладки
            </Title>
          </div>
          <Badge count={filteredBookmarks.length} showZero>
            <Tag color="blue" className="px-3 py-1">Всего закладок</Tag>
          </Badge>
        </div>

        {/* Панель фильтров */}
        <Card className="mb-6 shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <Search
              placeholder="Поиск по названию или заметке..."
              allowClear
              onChange={debounce((e) => setSearchText(e.target.value), 300)}
              className="md:w-64"
            />
            <Select
              placeholder="Фильтр по книге"
              allowClear
              options={books}
              onChange={setSelectedBook}
              className="md:w-64"
            />
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { label: 'По дате', value: 'date' },
                { label: 'По номеру страницы', value: 'page' },
              ]}
              className="md:w-48"
            />
          </div>
        </Card>

        {/* Список закладок */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spin size="large" />
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={searchText ? "Закладки не найдены" : "У вас пока нет закладок"}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full"
                >
                  <Card
                    className="h-full shadow hover:shadow-md transition-shadow"
                    actions={[
                      <Tooltip title="Перейти к странице">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/books/read/${bookmark.bookId}?page=${bookmark.pageNumber}`)}
                        />
                      </Tooltip>,
                      <Tooltip title="Редактировать">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(bookmark)}
                        />
                      </Tooltip>,
                      <Tooltip title="Удалить">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Text strong className="text-lg line-clamp-1">
                          {bookmark.title}
                        </Text>
                        <Tag color={bookmark.color || '#3B82F6'}>
                          Стр. {bookmark.pageNumber}
                        </Tag>
                      </div>
                      
                      <Text type="secondary" className="text-sm line-clamp-1">
                        {bookmark.book.title}
                      </Text>
                      
                      {bookmark.note && (
                        <Text className="text-gray-600 text-sm line-clamp-2 mt-2">
                          {bookmark.note}
                        </Text>
                      )}
                      
                      <Text type="secondary" className="text-xs mt-2">
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <Modal
        title={
          <div className="flex items-center gap-3 text-lg bg-gradient-to-r from-indigo-50 to-blue-50 p-4 -mt-6 -mx-6 mb-4 border-b border-indigo-100">
            <EditOutlined className="text-indigo-500" />
            <span className="text-indigo-900">
              Редактировать закладку
            </span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingBookmark(null);
          form.resetFields();
        }}
        footer={null}
        className="rounded-2xl overflow-hidden [&_.ant-modal-content]:rounded-2xl"
        width={480}
      >
        <Form
          form={form}
          onFinish={handleUpdateBookmark}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название закладки' }]}
          >
            <Input className="rounded-lg" />
          </Form.Item>

          <Form.Item name="color" label="Цвет">
            <ColorPicker 
              className="w-full"
              format="hex"
            />
          </Form.Item>
          
          <Form.Item name="note" label="Заметка">
            <Input.TextArea 
              rows={4} 
              className="rounded-lg"
              placeholder="Добавьте заметку к закладке..."
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                if (editingBookmark) {
                  handleDeleteBookmark(editingBookmark.id);
                  setIsEditModalVisible(false);
                  setEditingBookmark(null);
                }
              }}
              className="hover:bg-red-50"
            >
              Удалить
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={updateBookmark.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default Bookmarks; 