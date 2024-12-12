import React from 'react';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const AdminGenres: React.FC = () => {
  return (
    <Content className="p-6 md:p-8">
      <Title level={2}>Управление жанрами</Title>
      {/* Добавим таблицу и управление позже */}
    </Content>
  );
};

export default AdminGenres; 