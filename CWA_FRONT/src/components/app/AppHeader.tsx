import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Space } from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  BookOutlined,
  TagsFilled,
  UsergroupAddOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAccessToken } from '../../redux/slices/auth/authSlice';
import { getUserData } from '../../redux/slices/user/userSelectors';
import NotificationBell from '../notifications/NotificationBell';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector(getUserData);
  const isAdmin = userData?.role === 'ADMIN';

  const menuItems = [
    {
      key: '/main',
      icon: <HomeOutlined />,
      label: 'Главная',
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: 'Мои книги',
    },
    {
      key: '/bookmarks',
      icon: <TagsFilled />,
      label: 'Закладки',
    },
    {
      key: '/subscriptions',
      icon: <UsergroupAddOutlined />,
      label: 'Подписки',
    },
    ...(isAdmin ? [
      {
        key: '/admin',
        icon: <DashboardOutlined className="text-red-500" />,
        label: 'Админ панель',
      }
    ] : []),
  ];

  const profileMenu = (
    <Menu className="py-2 rounded-lg shadow-lg">
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Профиль
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        onClick={() => dispatch(setAccessToken(null))}
        className="text-red-500"
      >
        Выйти
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="bg-gradient-to-r from-[#001529] to-[#002140] flex justify-between items-center px-6 shadow-md">
      <div className="flex items-center flex-1">
        <div 
          className="text-white text-2xl font-bold tracking-wide cursor-pointer mr-8"
          onClick={() => navigate('/main')}
        >
          ЛитераТек
        </div>
        
        <Menu 
          theme="dark" 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          className="bg-transparent border-0 flex-1"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          overflowedIndicator={null}
          disabledOverflow={true}
        />
      </div>

      <Space size="middle">
        <NotificationBell />
        <Dropdown overlay={profileMenu} trigger={['hover']}>
          <Space className="cursor-pointer px-3 py-1 rounded hover:bg-white/10 transition-colors">
            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
            <span className="text-white font-medium">
              {userData?.name || 'Гость'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;