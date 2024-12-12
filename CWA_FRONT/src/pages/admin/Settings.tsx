import React from 'react';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const AdminSettings: React.FC = () => {
  return (
    <Content className="p-6 md:p-8">
      <Title level={2}>Настройки системы</Title>
      {/* Добавим формы настроек позже */}
    </Content>
  );
};

export default AdminSettings; 