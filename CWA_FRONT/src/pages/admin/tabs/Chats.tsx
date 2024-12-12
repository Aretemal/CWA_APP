import React, { useEffect } from 'react';
import { Layout, List, Card, Input, Button, Avatar, Badge, Typography, Spin, Empty } from 'antd';
import { SendOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../config/axios';
import { API_PATHS } from '../../../constants/apiPaths';
import useSocket from '../../../hooks/useSocket';

const { Sider, Content } = Layout;
const { Text } = Typography;

interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
}

export const AdminChats: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = React.useState<number | undefined>(undefined);
  const [message, setMessage] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { messages, sendMessage, loadMessages, isLoading: messagesLoading, isConnected } = useSocket();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users', 'chat', searchQuery],
    queryFn: () => 
      axios.get(API_PATHS.CHAT.USERS, {
        params: { search: searchQuery },
      }).then((res) => res.data),
  });

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId, loadMessages]);

  useEffect(() => {
    console.log('Connection status:', isConnected);
  }, [isConnected]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUserId || !isConnected) return;

    try {
      await sendMessage(message, selectedUserId);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Layout className="h-[calc(100vh-200px)] bg-white">
      <Sider width={300} className="bg-white border-r">
        <div className="p-4">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Поиск пользователя..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
            allowClear
          />
          {usersLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Spin />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Empty description="Пользователи не найдены" />
          ) : (
            <List
              dataSource={filteredUsers}
              renderItem={(user) => (
                <List.Item
                  className={`cursor-pointer hover:bg-gray-50 rounded-lg p-3 mb-2 transition-colors ${
                    selectedUserId === user.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center w-full">
                    <Badge dot status="success">
                      <Avatar>{user.name?.[0] || user.email[0]}</Avatar>
                    </Badge>
                    <div className="ml-3 flex-1 min-w-0">
                      <Text strong className="block truncate">
                        {user.name || user.email}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Sider>

      <Content className="bg-gray-50">
        {selectedUserId ? (
          <div className="flex flex-col h-full">
            <div className="bg-white border-b p-4">
              <Text strong>
                {users.find(u => u.id === selectedUserId)?.name || 
                 users.find(u => u.id === selectedUserId)?.email}
              </Text>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {messagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Spin />
                </div>
              ) : messages.length === 0 ? (
                <Empty description="Нет сообщений" />
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${
                      msg.isAdmin ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.isAdmin
                          ? 'bg-blue-500 text-white'
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                      <Text className={`text-xs ${msg.isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </Text>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-white p-4 border-t">
              <Input.TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Введите сообщение..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="mb-2"
                disabled={!isConnected}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSend}
                className="float-right"
                disabled={!isConnected}
              >
                Отправить
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Выберите пользователя для начала общения
          </div>
        )}
      </Content>
    </Layout>
  );
}; 