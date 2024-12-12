import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { 
  BookOutlined, 
  TagOutlined, 
  TeamOutlined,
  BellOutlined,
  SettingOutlined,
  MessageOutlined
} from '@ant-design/icons';
import AdminGenres from './tabs/Genres';
import AdminNotifications from './tabs/Notifications';
import AdminSettings from './tabs/Settings';
import AdminUsers from './tabs/Users';
import AdminBooks from './tabs/Books';
import { AdminChats } from './tabs/Chats';

const { Content, Sider } = Layout;
const { Title } = Typography;

type TabKey = 'books' | 'genres' | 'users' | 'notifications' | 'settings' | 'chats';

type MenuItem = Required<MenuProps>['items'][number];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('books');

  const menuItems: MenuItem[] = [
    {
      key: 'books',
      icon: <BookOutlined />,
      label: 'Книги',
    },
    {
      key: 'genres',
      icon: <TagOutlined />,
      label: 'Жанры',
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Пользователи',
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Уведомления',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
    {
      key: 'chats',
      icon: <MessageOutlined />,
      label: 'Чаты',
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'books':
        return <AdminBooks />;
      case 'genres':
        return <AdminGenres />;
      case 'users':
        return <AdminUsers />;
      case 'notifications':
        return <AdminNotifications />;
      case 'settings':
        return <AdminSettings />;
      case 'chats':
        return <AdminChats />;
      default:
        return null;
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        width={260}
        className="bg-white shadow-md"
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="p-4">
          <Title level={4} className="!mb-0 text-gray-700">
            Панель администратора
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => setActiveTab(key as TabKey)}
          className="border-r-0"
        />
      </Sider>
      <Content className="p-6 bg-gray-100">
        {renderContent()}
      </Content>
    </Layout>
  );
};

export default AdminDashboard; 