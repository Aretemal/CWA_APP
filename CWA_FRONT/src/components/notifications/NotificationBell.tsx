import React, { useState } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin, Space, Tag } from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMyNotifications, useUnreadCount, useMarkAsRead } from '../../api/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserNotification } from '../../types/notifications';

const { Text } = Typography;

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading } = useMyNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead.mutateAsync(id);
      setOpen(false); // Закрываем попап после прочтения
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const content = (
    <div className="w-96 max-h-[600px] overflow-auto">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <Space className="w-full" direction="vertical">
          <div className="flex justify-between items-center">
            <Space>
              <BellOutlined className="text-xl text-blue-500" />
              <Text strong className="text-lg">Уведомления</Text>
            </Space>
            <Badge 
              count={unreadCount} 
              style={{ 
                backgroundColor: unreadCount ? '#1890ff' : '#52c41a',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          {unreadCount > 0 && (
            <Text type="secondary" className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              У вас {unreadCount} непрочитанных уведомлений
            </Text>
          )}
        </Space>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Нет уведомлений"
          className="my-8"
        />
      ) : (
        <List<UserNotification>
          dataSource={notifications}
          renderItem={(item) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <List.Item
                className={`border-b last:border-b-0 p-4 hover:bg-gray-50 transition-all duration-300 ${
                  !item.viewed ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''
                }`}
              >
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!item.viewed && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                        <Text strong className="text-gray-800">
                          {item.notification.title}
                        </Text>
                      </div>
                      <Text className="text-gray-600 block">
                        {item.notification.description}
                      </Text>
                    </div>
                    {!item.viewed && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleMarkAsRead(item.id)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Прочитано
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Space size="small">
                      <ClockCircleOutlined className="text-gray-400" />
                      <Text type="secondary" className="text-sm">
                        {new Date(item.notification.createdAt).toLocaleString()}
                      </Text>
                    </Space>
                    <Tag 
                      color={item.viewed ? 'default' : 'blue'}
                      className={`${!item.viewed ? 'shadow-sm' : ''}`}
                    >
                      {item.viewed ? 'Прочитано' : 'Новое'}
                    </Tag>
                  </div>

                  {item.notification.recipients !== 'all' && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <UserOutlined className="text-blue-500" />
                      <Text type="secondary" className="text-sm">
                        Личное уведомление
                      </Text>
                    </div>
                  )}
                </div>
              </List.Item>
            </motion.div>
          )}
        />
      )}

      {notifications.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <Button 
            block
            type="default"
            onClick={() => setOpen(false)}
            className="hover:bg-gray-100 transition-colors"
          >
            Закрыть
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      overlayClassName="notification-popover"
      overlayStyle={{ padding: 0 }}
    >
      <Badge 
        count={unreadCount} 
        offset={[-2, 2]}
        className={unreadCount ? 'animate-bounce' : ''}
      >
        <Button
          type="text"
          icon={<BellOutlined className="text-xl text-white" />}
          className="flex items-center justify-center w-10 h-10 hover:bg-white/10 transition-colors"
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell; 