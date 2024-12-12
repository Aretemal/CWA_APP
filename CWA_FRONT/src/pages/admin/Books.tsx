import React from 'react';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const AdminBooks: React.FC = () => {
  return (
    <Content className="p-6 md:p-8">
      <Title level={2}>Управление книгами</Title>
      {/* Добавим таблицу и управление позже */}
    </Content>
  );
};

export default AdminBooks; 