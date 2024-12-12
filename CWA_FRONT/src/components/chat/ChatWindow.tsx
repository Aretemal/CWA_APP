import React, { useEffect, useRef } from 'react';
import { Card, Input, Button, Avatar, Spin, Empty } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { getUserData } from '../../redux/slices/user/userSelectors';
import { useSocket } from '../../hooks/useSocket';
import type { Message } from '../../types/chat';

interface Props {
  onClose: () => void;
}

export const ChatWindow: React.FC<Props> = ({ onClose }) => {
  const [message, setMessage] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userData = useSelector(getUserData);
  const { messages, sendMessage, loadMessages, isLoading, isConnected } = useSocket();

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!message.trim() || !isConnected) return;

    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Card
      className="fixed bottom-20 left-6 w-1/5 shadow-xl"
      title="Чат с администратором"
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
      bodyStyle={{ padding: 0 }}
    >
      <div className="h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Spin />
            </div>
          ) : messages.length === 0 ? (
            <Empty description="Нет сообщений" />
          ) : (
            messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${
                  msg.userId === userData?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    msg.userId === userData?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100'
                  } rounded-lg px-4 py-2`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar size="small">{msg.user.name?.[0] || msg.user.email[0]}</Avatar>
                    <span className="text-xs">
                      {msg.user.name || msg.user.email}
                    </span>
                  </div>
                  <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4">
          <Input.Group compact>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={handleSend}
              placeholder="Введите сообщение..."
              className="w-[calc(100%-40px)]"
              disabled={!isConnected}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!isConnected}
            />
          </Input.Group>
        </div>
      </div>
    </Card>
  );
}; 