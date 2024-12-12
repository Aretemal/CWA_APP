import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout, Typography, Card, Button, Avatar, Space, Empty, Spin, Input, Row, Col, Tag, Tooltip, Tabs, message } from 'antd';
import { 
  UserOutlined, 
  SearchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFollowing, useFollowers, useSearchUsers, useFollowUser, useUnfollowUser } from '../api/subscriptions';
import BookCard from '../components/books/BookCard';
import { API_URL } from '../constants/apiUrl';
import type { UserWithBooks } from '../types/subscriptions';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Search } = Input;
const { TabPane } = Tabs;

interface UserCardProps {
  user: UserWithBooks;
  onFollow?: () => void;
  onUnfollow?: () => void;
  isFollowing?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollow, onUnfollow, isFollowing }) => {
  const navigate = useNavigate();
  
  return (
    <Card
      className="h-[500px] hover:shadow-lg transition-shadow"
      actions={[
        isFollowing ? (
          <Button
            type="text"
            danger
            icon={<UserDeleteOutlined />}
            onClick={onUnfollow}
          >
            Отписаться
          </Button>
        ) : (
          <Button
            type="text"
            icon={<UserAddOutlined />}
            onClick={onFollow}
          >
            Подписаться
          </Button>
        )
      ]}
    >
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar 
            size={64} 
            icon={<UserOutlined />}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          />
          <div>
            <Title level={5} className="!mb-1">{user.name || 'Без имени'}</Title>
            <Text type="secondary" className="text-sm">{user.email}</Text>
          </div>
        </div>
      </div>

      {user.books && user.books.length > 0 ? (
        <div className="overflow-auto" style={{ height: '280px' }}>
          <Title level={5} className="!mb-4">Книги автора</Title>
          <div className="grid grid-cols-2 gap-4">
            {user.books.slice(0, 4).map((book: { 
              id: number; 
              title: string; 
              author: string; 
              imageUrl?: string; 
            }) => (
              <div 
                key={book.id}
                className="cursor-pointer"
                onClick={() => navigate(`/books/read/${book.id}`)}
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                  {book.imageUrl ? (
                    <img
                      src={`${API_URL}${book.imageUrl}`}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const container = target.parentElement!;
                        const defaultCover = document.createElement('div');
                        container.appendChild(defaultCover);
                        const root = createRoot(defaultCover);
                        root.render(<BookCard.DefaultCover title={book.title} author={book.author} />);
                      }}
                    />
                  ) : (
                    <BookCard.DefaultCover title={book.title} author={book.author} />
                  )}
                </div>
                <Tooltip title={book.title}>
                  <Text className="block text-sm truncate">{book.title}</Text>
                </Tooltip>
              </div>
            ))}
          </div>
          {user.books.length > 4 && (
            <Button 
              type="link" 
              block 
              className="mt-4"
              onClick={() => navigate('/books', { state: { authorId: user.id } })}
            >
              Показать все книги ({user.books.length})
            </Button>
          )}
        </div>
      ) : (
        <Empty 
          description="Нет книг" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

const Subscriptions: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('following');
  const [messageApi, contextHolder] = message.useMessage();
  
  const { data: following = [], isLoading: followingLoading } = useFollowing();
  const { data: followers = [], isLoading: followersLoading } = useFollowers();
  const { data: searchResults = [], isLoading: searchLoading } = useSearchUsers(searchText);
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isUserFollowed = (userId: number) => {
    return following.some(user => user.id === userId);
  };

  const handleFollow = async (userId: number) => {
    try {
      await followMutation.mutateAsync(userId);
      messageApi.success('Вы успешно подписались на пользователя');
    } catch (error) {
      console.error('Error following user:', error);
      messageApi.error('Не удалось подписаться на пользователя');
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await unfollowMutation.mutateAsync(userId);
      messageApi.success('Вы отписались от пользователя');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      messageApi.error('Не удалось отписаться от пользователя');
    }
  };

  const renderUserList = (users: UserWithBooks[], forceFollowing = false) => (
    <Row gutter={[24, 24]}>
      {users.map(user => (
        <Col key={user.id} xs={24} sm={12} md={8} lg={6}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UserCard 
              user={user}
              isFollowing={forceFollowing || isUserFollowed(user.id)}
              onFollow={() => handleFollow(user.id)}
              onUnfollow={() => handleUnfollow(user.id)}
            />
          </motion.div>
        </Col>
      ))}
    </Row>
  );

  return (
    <Content className="p-8">
      {contextHolder}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <Title level={2} className="!mb-2">Подписки</Title>
          <Text type="secondary">Управление подписками</Text>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="mb-8"
        >
          <TabPane tab="Мои подписки" key="following">
            <Search
              placeholder="Поиск по подпискам"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onChange={e => setSearchText(e.target.value)}
              className="max-w-xl mb-8"
            />
            
            {followingLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : following.length === 0 ? (
              <Empty description="Нет подписок" />
            ) : (
              renderUserList(following, true)
            )}
          </TabPane>

          <TabPane tab="Мои подписчики" key="followers">
            {followersLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : followers.length === 0 ? (
              <Empty description="Нет подписчиков" />
            ) : (
              renderUserList(followers)
            )}
          </TabPane>

          <TabPane tab="Поиск пользователей" key="search">
            <Search
              placeholder="Поиск пользователей"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onChange={e => setSearchText(e.target.value)}
              className="max-w-xl mb-8"
            />
            
            {searchLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : !searchResults || searchResults.length === 0 ? (
              <Empty description="Пользователи не найдены" />
            ) : (
              renderUserList(searchResults as UserWithBooks[])
            )}
          </TabPane>
        </Tabs>
      </motion.div>
    </Content>
  );
};

export default Subscriptions; 