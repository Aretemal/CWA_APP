import React from 'react';
import { List, Card, Avatar, Button, Space, Input, Empty, Spin, Badge } from 'antd';
import { UserOutlined, BookOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearchUsers, useFollowUser, useUnfollowUser } from '../../api/subscriptions';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

interface UserSearchProps {
  onUserClick?: (userId: number) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserClick }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data: users = [], isLoading } = useSearchUsers(searchTerm);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const navigate = useNavigate();

  const handleSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleFollowToggle = async (userId: number, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(userId);
      } else {
        await followUser.mutateAsync(userId);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
        <Input
          placeholder="Поиск пользователей..."
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 py-3 rounded-xl bg-white/50 backdrop-blur-sm border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
          size="large"
        />
      </div>

      <List
        grid={{ 
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 3,
        }}
        dataSource={users}
        loading={isLoading}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500">
                  {searchTerm ? "Пользователи не найдены" : "Нет доступных пользователей"}
                </span>
              }
            />
          ),
        }}
        renderItem={(user) => (
          <List.Item>
            <Card
              hoverable
              className="h-full shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              bodyStyle={{ padding: '1.5rem' }}
              onClick={() => navigate(`/users/${user.id}/bookshelves`)}
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <Space size="middle" align="start">
                    <Badge count={user._count.books} overflowCount={99}>
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        className="bg-gradient-to-br from-blue-500 to-indigo-500"
                      />
                    </Badge>
                    <div>
                      <div className="font-medium text-lg">{user.name || user.email}</div>
                      <div className="text-gray-500 text-sm space-x-3">
                        <span>{user._count.books} книг</span>
                        <span>•</span>
                        <span>{user._count.followers} подписчиков</span>
                      </div>
                    </div>
                  </Space>
                  <Button
                    type={user.isFollowing ? 'default' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle(user.id, user.isFollowing);
                    }}
                    className={
                      user.isFollowing
                        ? 'border-gray-300 hover:border-gray-400'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 border-0 hover:from-blue-600 hover:to-indigo-600'
                    }
                  >
                    {user.isFollowing ? 'Отписаться' : 'Подписаться'}
                  </Button>
                </div>

                {user.books && user.books.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700 mb-3">Последние книги:</div>
                    <div className="grid grid-cols-3 gap-3">
                      {user.books.map((book) => (
                        <div
                          key={book.id}
                          className="aspect-[2/3] rounded-lg overflow-hidden relative group"
                        >
                          {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <BookOutlined className="text-2xl text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="text-white text-xs font-medium truncate">
                                {book.title}
                              </div>
                              <div className="text-gray-300 text-xs truncate">
                                {book.author}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserSearch; 