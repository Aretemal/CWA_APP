import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Input, Modal, Empty, Dropdown } from 'antd';
import { PlusOutlined, FolderOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import BookCard from '../components/books/BookCard';
import { useMyFolders } from '../api/folders';
import type { Book } from '../types/books';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Folders: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { data: folders = [], isLoading } = useMyFolders();

  const folderActions: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Переименовать',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Удалить',
      danger: true,
    },
  ];

  return (
    <Content className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Title level={2}>Мои папки</Title>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Создать папку
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Список папок */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <div className="space-y-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg cursor-pointer
                      ${activeFolder === folder.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => setActiveFolder(folder.id)}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOutlined className="text-lg text-blue-500" />
                      <Text>{folder.name}</Text>
                    </div>
                    <Dropdown menu={{ items: folderActions }} trigger={['click']}>
                      <Button 
                        type="text" 
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Содержимое папки */}
          <div className="md:col-span-3">
            {activeFolder ? (
              <>
                <div className="mb-6">
                  <Search 
                    placeholder="Поиск книг в папке..." 
                    className="max-w-md"
                  />
                </div>
                <Row gutter={[16, 16]}>
                  {folders
                    .find(f => f.id === activeFolder)
                    ?.books.map((book: Book) => (
                      <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                        <BookCard book={book} />
                      </Col>
                    ))}
                </Row>
              </>
            ) : (
              <Empty description="Выберите папку" />
            )}
          </div>
        </div>

        <Modal
          title="Создать папку"
          open={isCreateModalOpen}
          onOk={() => {
            // Здесь будет логика создания папки
            setIsCreateModalOpen(false);
            setNewFolderName('');
          }}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setNewFolderName('');
          }}
        >
          <Input
            placeholder="Название папки"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </Modal>
      </div>
    </Content>
  );
};

export default Folders; 