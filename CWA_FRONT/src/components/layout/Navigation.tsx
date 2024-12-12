import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  FolderOutlined,
  BookFilled,
} from '@ant-design/icons';

const Navigation: React.FC = () => {
  const location = useLocation();

  const items = [
    {
      key: 'main',
      icon: <HomeOutlined />,
      label: <Link to="/main">Главная</Link>,
    },
    {
      key: 'books',
      icon: <BookOutlined />,
      label: <Link to="/books">Книги</Link>,
    },
    {
      key: 'folders',
      icon: <FolderOutlined />,
      label: <Link to="/folders">Папки</Link>,
    },
    {
      key: 'bookmarks',
      icon: <BookFilled />,
      label: <Link to="/bookmarks">Закладки</Link>,
    },
    {
      key: 'subscriptions',
      icon: <UserOutlined />,
      label: <Link to="/subscriptions">Подписки</Link>,
    },
  ];

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname.split('/')[1] || 'main']}
      items={items}
      className="flex-1"
    />
  );
};

export default Navigation; 