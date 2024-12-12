import React from 'react';
import { Button, Badge } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useUnreadMessages } from '../../api/chat';

interface Props {
  onClick: () => void;
}

export const ChatButton: React.FC<Props> = ({ onClick }) => {
  const { data: unreadCount = 0 } = useUnreadMessages();

  return (
    <div className="fixed bottom-6 left-6">
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={onClick}
          className="shadow-lg hover:scale-105 transition-transform"
        />
      </Badge>
    </div>
  );
}; 