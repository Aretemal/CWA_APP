import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { Flex, Spin, notification } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import AppHeader from './components/app/AppHeader';
import BooksMain from './pages/BooksMain';
import ReadBook from './pages/ReadBook';
import AppFooter from './components/app/AppFooter';
import CreateBook from './pages/CreateBook';
import { getAuthToken } from './redux/slices/auth/authSelectors';
import { getUserData } from './redux/slices/user/userSelectors';
import { useUserProfile } from './api/users';
import { setUser } from './redux/slices/user/userSlice';
import Genres from './pages/Genres';
import Bookmarks from './pages/Bookmarks';
import Home from './pages/Home';
import Subscriptions from './pages/Subscriptions';
import AdminBooks from './pages/admin/Books';
import AdminGenres from './pages/admin/Genres';
import AdminUsers from './pages/admin/Users';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import { NotificationProvider } from './components/notifications/NotificationProvider';
import { useMyNotifications } from './api/notifications';
import type { UserNotification } from './types/notifications';
import { ChatButton } from './components/chat/ChatButton';
import { ChatWindow } from './components/chat/ChatWindow';
import type { AppUser } from './types/user';
import type { User, UserProfile } from './types/user';
import Folders from './pages/Folders';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userData = useSelector(getUserData);
  
  if (!userData?.isAdmin) {
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
};

function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(getAuthToken);
  const { data: userProfile, isLoading: profileLoading } = useUserProfile<UserProfile>();
  const { data: notifications = [], isLoading: notificationsLoading } = useMyNotifications();
  const userData = useSelector(getUserData);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/auth/login', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (userProfile) {
      const user: User = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        createdAt: userProfile.createdAt,
        books: userProfile.books || [],
      };
      dispatch(setUser(user));
    }
  }, [userProfile, dispatch]);

  if (profileLoading || notificationsLoading) {
    return (
      <Flex className="min-h-screen w-full items-center justify-center">
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <NotificationProvider>
      <Flex
        className="min-h-screen w-full"
        justify="space-between"
        vertical
      >
        <AppHeader />
        <Flex className="flex-1 bg-gray-100">
          <Routes>
            <Route path="/main" element={<Home />} />
            <Route path="/books" element={<BooksMain />} />
            <Route path="/books/read/:id" element={<ReadBook />} />
            <Route path="/create-book" element={<CreateBook />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/folders" element={<Folders />} />
            <Route path="/" element={<Navigate to="/main" replace />} />
            <Route path="*" element={<Navigate to="/main" replace />} />
          </Routes>
        </Flex>
        <AppFooter />
        {userData && !userData.isAdmin && (
          <>
            <ChatButton onClick={() => setIsChatOpen(true)} />
            {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
          </>
        )}
      </Flex>
    </NotificationProvider>
  );
}

export default AppLayout;
