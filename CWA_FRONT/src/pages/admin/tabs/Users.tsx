import React, { useState } from 'react';
import { Table, Button, Space, Typography, Input, Tooltip, Tag, Modal, message } from 'antd';
import { 
  LockOutlined, 
  UnlockOutlined,
  SearchOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { useUsers, useUpdateUserRole, useDeleteUser } from '../../../api/users';
import type { User } from '../../../types/auth';

const { Title } = Typography;

const AdminUsers: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const { data: users = [], isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{name || 'Не указано'}</span>
          <span className="text-gray-500 text-sm">{record.email}</span>
        </Space>
      ),
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
        </Tag>
      ),
    },
    {
      title: 'Книг добавлено',
      dataIndex: 'books',
      key: 'books',
      render: (books: any[]) => books?.length || 0,
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: User) => (
        <Space>
          <Tooltip title={record.role === 'ADMIN' ? 'Снять права админа' : 'Сделать админом'}>
            <Button 
              type="text" 
              icon={record.role === 'ADMIN' ? <UnlockOutlined /> : <LockOutlined />}
              onClick={() => handleRoleToggle(record)}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button 
              type="text" 
              danger 
              icon={<UserDeleteOutlined />} 
              onClick={() => {
                setSelectedUser(record);
                setIsDeleteModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleRoleToggle = async (user: User) => {
    try {
      await updateRole.mutateAsync({
        userId: user.id,
        role: user.role === 'ADMIN' ? 'USER' : 'ADMIN'
      });
      message.success('Роль пользователя успешно обновлена');
    } catch (error) {
      message.error('Ошибка при обновлении роли');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(selectedUser.id);
      message.success('Пользователь успешно удален');
      setIsDeleteModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      message.error('Ошибка при удалении пользователя');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">
          Управление пользователями
        </Title>
        <Space>
          <Input
            placeholder="Поиск по имени или email"
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={e => setSearchText(e.target.value)}
            className="w-64"
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Всего ${total} пользователей`,
        }}
      />

      <Modal
        title="Удаление пользователя"
        open={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedUser(null);
        }}
        onOk={handleDelete}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <p>
          Вы действительно хотите удалить пользователя{' '}
          <strong>{selectedUser?.name || selectedUser?.email}</strong>?
        </p>
        <p className="text-red-500">
          Это действие нельзя отменить. Все книги и закладки пользователя будут удалены.
        </p>
      </Modal>
    </div>
  );
};

export default AdminUsers; 