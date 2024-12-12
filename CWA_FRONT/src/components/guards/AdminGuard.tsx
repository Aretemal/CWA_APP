import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserData } from '../../redux/slices/user/userSelectors';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const userData = useSelector(getUserData);
  const isAdmin = userData?.role === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard; 