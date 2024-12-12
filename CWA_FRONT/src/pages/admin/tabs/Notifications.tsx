import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Modal, 
  Form, 
  Select, 
  message, 
  Tag,
  Tooltip,
  Badge,
  Card,
  Statistic 
} from 'antd';
import { 
  SendOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  PlusOutlined,
  BellOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAllNotifications, useCreateNotification, useDeleteNotification } from '../../../api/notifications';
import { useUsers } from '../../../api/users';
import type { Notification, UserNotification } from '../../../types/notifications';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminNotifications: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [form] = Form.useForm();

  const { data: notifications = [], isLoading } = useAllNotifications();
  console.log('Notifications:', notifications);
  const { data: users = [] } = useUsers();
  const createNotification = useCreateNotification();
  const deleteNotification = useDeleteNotification();

  const handleCreate = async (values: { title: string; description: string; recipients: string }) => {
    try {
      await createNotification.mutateAsync(values);
      message.success('Уведомление отправлено');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при отправке уведомления');
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;

    try {
      await deleteNotification.mutateAsync(selectedNotification.id);
      message.success('Уведомление удалено');
      setDeleteModalVisible(false);
      setSelectedNotification(null);
    } catch (error) {
      message.error('Ошибка при удалении уведомления');
    }
  };

  // Статистика
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(n => n && !n.viewed).length;
  const readNotifications = totalNotifications - unreadNotifications;

  const columns = [
    {
      title: 'Заголовок',
      key: 'title',
      render: (record: UserNotification) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.notification.title}</Text>
          <Text type="secondary" className="text-sm">
            {record.notification.description}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Получатели',
      key: 'recipients',
      render: (record: UserNotification) => (
        <Tag color={record.notification.recipients === 'all' ? 'blue' : 'green'}>
          {record.notification.recipients === 'all' ? 'Все пользователи' : 'Конкретный пользователь'}
        </Tag>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (record: UserNotification) => (
        <Badge 
          status={record.viewed ? 'success' : 'processing'} 
          text={record.viewed ? 'Прочитано' : 'Не прочитано'}
        />
      ),
    },
    {
      title: 'Дата',
      key: 'createdAt',
      render: (record: UserNotification) => (
        <Tooltip title={new Date(record.createdAt).toLocaleString()}>
          <Space>
            <ClockCircleOutlined />
            {new Date(record.createdAt).toLocaleDateString()}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (record: UserNotification) => (
        <Space>
          <Tooltip title="Отправить повторно">
            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  title: record.notification.title,
                  description: record.notification.description,
                  recipients: record.notification.recipients,
                });
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedNotification(record.notification);
                setDeleteModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Statistic
            title="Всего уведомлений"
            value={totalNotifications}
            prefix={<BellOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Прочитано"
            value={readNotifications}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Не прочитано"
            value={unreadNotifications}
            prefix={<BellOutlined />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </div>

      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <Title level={3} className="!mb-0">
          Управление уведомлениями
        </Title>
        <Space>
          <Input
            placeholder="Поиск по заголовку"
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={e => setSearchText(e.target.value)}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Создать уведомление
          </Button>
        </Space>
      </div>

      {/* Таблица */}
      <Table
        columns={columns}
        dataSource={notifications.filter(n => {
          console.log('Filtering notification:', n);
          return n && n.notification && n.notification.title.toLowerCase().includes(searchText.toLowerCase());
        })}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Всего ${total} уведомлений`,
        }}
      />

      {/* Модальное окно создания/редактирования */}
      <Modal
        title="Отправить уведомление"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ recipients: 'all' }}
        >
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="recipients"
            label="Получатели"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="all">Все пользователи</Select.Option>
              {users.map(user => (
                <Select.Option key={user.id} value={String(user.id)}>
                  {user.name || user.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Отправить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно удаления */}
      <Modal
        title="Удаление уведомления"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedNotification(null);
        }}
        onOk={handleDelete}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <p>
          Вы действительно хотите удалить уведомление{' '}
          <strong>{selectedNotification?.title}</strong>?
        </p>
        <p className="text-red-500">
          Это действие нельзя отменить.
        </p>
      </Modal>
    </div>
  );
};

export default AdminNotifications; 