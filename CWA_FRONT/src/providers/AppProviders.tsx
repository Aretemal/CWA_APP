import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import store from '../redux/store';
import queryClient from '../react-query/queryClient';

interface Props {
  children: React.ReactNode;
}

export const AppProviders: React.FC<Props> = ({ children }) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AntdApp>
            {children}
          </AntdApp>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}; 