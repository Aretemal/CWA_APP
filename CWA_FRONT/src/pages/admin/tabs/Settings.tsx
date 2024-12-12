import React from 'react';
import { Card, Typography, Form, Input, Button, Switch, Space, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log(values);
    message.info('Функция сохранения настроек в разработке');
  };

  return (
    <div>
      <Title level={3} className="mb-6">
        Настройки системы
      </Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Основные настройки">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              siteName: 'ЛитераТек',
              allowRegistration: true,
              maxUploadSize: 50,
            }}
          >
            <Form.Item
              name="siteName"
              label="Название сайта"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="allowRegistration"
              label="Разрешить регистрацию"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="maxUploadSize"
              label="Максимальный размер файла (МБ)"
              rules={[{ required: true }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                htmlType="submit"
              >
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Уведомления">
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              emailNotifications: true,
              adminEmails: 'admin@literatech.com',
            }}
          >
            <Form.Item
              name="emailNotifications"
              label="Email уведомления"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="adminEmails"
              label="Email администраторов"
              rules={[{ type: 'email' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                htmlType="submit"
              >
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings; 