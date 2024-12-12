import React, { useState } from 'react';
import { Table, Button, Space, Typography, Input, Tag, Modal, message } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useBooks, useDeleteBook } from '../../../api/books';
import type { Book } from '../../../types/books';

const { Title } = Typography;

const AdminBooks: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const { data: books = [], isLoading } = useBooks();
  const deleteBook = useDeleteBook();

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchText.toLowerCase()) ||
    book.author.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      await deleteBook.mutateAsync(selectedBook.id);
      message.success('Книга успешно удалена');
      setIsDeleteModalVisible(false);
      setSelectedBook(null);
    } catch (error) {
      message.error('Ошибка при удалении книги');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Book) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <span className="text-gray-500 text-sm">{record.author}</span>
        </Space>
      ),
    },
    {
      title: 'Жанры',
      dataIndex: 'genres',
      key: 'genres',
      render: (genres: { id: number; name: string }[]) => (
        <Space size={[0, 4]} wrap>
          {genres?.map(genre => (
            <Tag key={genre.id} color="blue">
              {genre.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Автор книги',
      dataIndex: ['user', 'name'],
      key: 'userName',
      render: (name: string) => name || 'Нет данных',
    },
    {
      title: 'Дата добавления',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Book) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => window.open(`/books/read/${record.id}`, '_blank')}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => message.info('Функция редактирования в разработке')}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {
              setSelectedBook(record);
              setIsDeleteModalVisible(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">
          Управление книгами
        </Title>
        <Space>
          <Input
            placeholder="Поиск по названию или автору"
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={e => setSearchText(e.target.value)}
            className="w-64"
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredBooks}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Всего ${total} книг`,
        }}
      />

      <Modal
        title="Удаление книги"
        open={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedBook(null);
        }}
        onOk={handleDelete}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <p>
          Вы действительно хотите удалить книгу{' '}
          <strong>{selectedBook?.title}</strong>?
        </p>
        <p className="text-red-500">
          Это действие нельзя отменить. Все закладки книги будут удалены.
        </p>
      </Modal>
    </div>
  );
};

export default AdminBooks; 