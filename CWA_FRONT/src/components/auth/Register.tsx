import React from 'react';
import { Button, Form, Input, Card, Typography, Layout, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { register } from '../../api/auth/regiter';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, MailOutlined, BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Content } = Layout;

const Register = () => {
    const navigate = useNavigate();
    
    const { mutate, isPending } = useMutation({
        mutationFn: (values: { name: string; email: string; password: string }) => 
            register(values.name, values.email, values.password),
        onSuccess: () => {
            message.success('Регистрация успешна! Теперь вы можете войти');
            navigate('/login');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Ошибка при регистрации');
        }
    });

    return (
        <Layout className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
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
                            <BookOutlined className="text-4xl text-purple-600 mb-4" />
                            <Title level={2} className="!mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Регистрация
                            </Title>
                            <Text type="secondary" className="text-base">
                                Создайте свой аккаунт в ЛитераТек
                            </Text>
                        </motion.div>

                        <Form
                            name="register"
                            onFinish={mutate}
                            layout="vertical"
                            size="large"
                        >
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Form.Item
                                    name="name"
                                    rules={[{ required: true, message: 'Введите имя' }]}
                                >
                                    <Input 
                                        prefix={<UserOutlined className="text-gray-400" />}
                                        placeholder="Имя"
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
                                transition={{ delay: 0.4 }}
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
                                transition={{ delay: 0.5 }}
                            >
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isPending}
                                        className="w-full h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 border-0 hover:from-purple-600 hover:to-blue-700"
                                        size="large"
                                    >
                                        Зарегистрироваться
                                    </Button>
                                </Form.Item>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center"
                            >
                                <Button 
                                    type="link" 
                                    onClick={() => navigate('/login')}
                                    className="text-purple-600 hover:text-blue-600"
                                >
                                    Уже есть аккаунт? Войти
                                </Button>
                            </motion.div>
                        </Form>
                    </Card>
                </motion.div>
            </Content>
        </Layout>
    );
};

export default Register;