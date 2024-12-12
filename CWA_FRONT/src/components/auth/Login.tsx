// src/Login.tsx
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../api/auth/login';
import { setAccessToken } from '../../redux/slices/auth/authSlice';
import { setUser } from '../../redux/slices/user/userSlice';
import { getAuthToken } from '../../redux/slices/auth/authSelectors';
import { Button, Form, Input, message, Card, Typography, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, MailOutlined, BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Content } = Layout;

interface LoginForm {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const accessToken = useSelector(getAuthToken);
    const [form] = Form.useForm();

    const { mutate, isPending, error } = useMutation({
        mutationFn: login,
        onSuccess: async (data) => {
            localStorage.setItem('token', data.access_token);
            dispatch(setAccessToken(data.access_token));
            message.success('Добро пожаловать!');
            navigate('/main');
        },
        onError: (error: any) => {
                message.error('Неверные учетные данные');
        },
    });
    if (accessToken) {
        navigate('/main');
        return null;
    }

    return (
        <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Content className="flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card 
                        bordered={false}
                        className="w-full max-w-md shadow-2xl rounded-2xl backdrop-blur-sm bg-white/90"
                        bodyStyle={{ padding: '2.5rem' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-8"
                        >
                            <BookOutlined className="text-4xl text-blue-600 mb-4" />
                            <Title level={2} className="!mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ЛитераТек
                            </Title>
                            <Text type="secondary" className="text-base">
                                Войдите в свой аккаунт
                            </Text>
                        </motion.div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={mutate}
                            autoComplete="off"
                            size="large"
                        >
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Form.Item
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Введите email' },
                                        { type: 'email', message: 'Некорректный email' }
                                    ]}
                                >
                                    <Input 
                                        prefix={<MailOutlined className="text-gray-400" />}
                                        placeholder="Email"
                                        className="rounded-lg h-12"
                                    />
                                </Form.Item>
                            </motion.div>

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Form.Item
                                    name="password"
                                    rules={[
                                        { required: true, message: 'Введите пароль' },
                                        { min: 6, message: 'Минимум 6 символов' }
                                    ]}
                                >
                                    <Input.Password 
                                        prefix={<LockOutlined className="text-gray-400" />}
                                        placeholder="Пароль"
                                        className="rounded-lg h-12"
                                    />
                                </Form.Item>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isPending}
                                        className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
                                        size="large"
                                    >
                                        Войти
                                    </Button>
                                </Form.Item>
                            </motion.div>
                        </Form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center mt-6"
                        >
                            <Text type="secondary">
                                Нет аккаунта?{' '}
                                <Button 
                                    type="link" 
                                    onClick={() => navigate('/register')}
                                    className="!p-0 !m-0 text-blue-600 hover:text-purple-600"
                                >
                                    Зарегистрироваться
                                </Button>
                            </Text>
                        </motion.div>
                    </Card>
                </motion.div>
            </Content>
        </Layout>
    );
};

export default Login;