import React from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/auth/Login';
import { getAuthToken } from './redux/slices/auth/authSelectors';
import AppLayout from './AppLayout';
import Register from './components/auth/Register';
import { BookPage } from './pages/book/BookPage';

function App() {
  const accessToken = useSelector(getAuthToken);

  if (!accessToken) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/main" replace />} />
      <Route path="/register" element={<Navigate to="/main" replace />} />
      <Route path="/books/:id" element={<BookPage />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

export default App;
