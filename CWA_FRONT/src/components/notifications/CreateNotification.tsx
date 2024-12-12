import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useCreateNotification } from '../../api/notifications';
import type { CreateNotificationDto } from '../../types/notifications';

export const CreateNotification: React.FC<{ users: any[] }> = ({ users }) => {
  const [form] = Form.useForm();
  const createMutation = useCreateNotification();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: CreateNotificationDto) => {
    try {
      await createMutation.mutateAsync(values);
      messageApi.success('Уведомление успешно создано');
      form.resetFields();
    } catch (error) {
      messageApi.error('Ошибка при создании уведомления');
    }
  };

  return (
    <>
      {contextHolder}
      <Form form={form} onFinish={handleSubmit}>
        {/* ... остальной код формы ... */}
      </Form>
    </>
  );
}; 