import React, { useState } from 'react';
import { Form, Input, Button, Upload, Select, message, Card, Typography, Flex, Space, Divider } from 'antd';
import { InboxOutlined, BookOutlined, FileTextOutlined, TagsOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCreateBook } from '../api/books';
import { useGenres } from '../api/genres';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

interface CreateBookFormData {
  title: string;
  author: string;
  genres: number[];
}

const CreateBook: React.FC = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm<CreateBookFormData>();
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null);
  const [previewImage, setPreviewImage] = useState('');

  const createBookMutation = useCreateBook();
  const { data: genres = [], isLoading: genresLoading } = useGenres();

  const onFinish = async (values: CreateBookFormData) => {
    if (!fileList.length) {
      message.error('Пожалуйста, загрузите файл книги');
      return;
    }

    const formData = new FormData();
    
    formData.append('title', values.title.trim());
    formData.append('author', values.author.trim());
    formData.append('genres', JSON.stringify(values.genres));
    formData.append('file', fileList[0]);
    
    if (coverFile?.originFileObj) {
      formData.append('cover', coverFile.originFileObj);
    }

    try {
      await createBookMutation.mutateAsync(formData);
      message.success('Книга успешно создана!');
      navigate('/books');
    } catch (error) {
      message.error('Ошибка при создании книги');
    }
  };

  const pdfUploadProps = {
    beforeUpload: (file: File) => {
      if (file.type !== 'application/pdf') {
        message.error('Можно загружать только PDF файлы!');
        return false;
      }
      const rcFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      }) as RcFile;
      rcFile.uid = Date.now().toString();
      setFileList([rcFile]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
    maxCount: 1,
  };

  const imageUploadProps = {
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Можно загружать только JPG/PNG файлы!');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Изображение должно быть меньше 10MB!');
        return false;
      }

      const rcFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      }) as RcFile;
      rcFile.uid = Date.now().toString();

      // Создаем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      setCoverFile({ ...rcFile, originFileObj: rcFile } as UploadFile);
      return false;
    },
    onRemove: () => {
      setCoverFile(null);
      setPreviewImage('');
    },
    fileList: coverFile ? [coverFile] : [],
    maxCount: 1,
  };

  return (
    <Flex justify="center" align="start" className="p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-md rounded-lg">
          <div className="text-center mb-8">
            <Title level={2} className="!mb-2">Создание новой книги</Title>
            <Text type="secondary">Заполните информацию о книге и загрузите файлы</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Основная информация */}
              <div className="space-y-6">
                <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
                  <Title level={4} className="flex items-center gap-2 !mb-4">
                    <BookOutlined className="text-blue-500" />
                    Основная информация
                  </Title>
                  
                  <Form.Item
                    label="Название книги"
                    name="title"
                    rules={[{ required: true, message: 'Введите название книги' }]}
                  >
                    <Input 
                      placeholder="Введите название книги"
                      className="rounded-lg" 
                    />
                  </Form.Item>

                  <Form.Item
                    label="Автор"
                    name="author"
                    rules={[{ required: true, message: 'Введите автора книги' }]}
                  >
                    <Input 
                      placeholder="Введите имя автора"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Описание"
                    name="description"
                  >
                    <TextArea 
                      rows={4}
                      placeholder="Введите описание книги"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>

                <div className="bg-purple-50/50 p-6 rounded-lg border border-purple-100">
                  <Title level={4} className="flex items-center gap-2 !mb-4">
                    <TagsOutlined className="text-purple-500" />
                    Жанры
                  </Title>
                  
                  <Form.Item
                    label="Выберите жанры"
                    name="genres"
                    rules={[{ required: true, message: 'Выберите хотя бы один жанр' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Выберите жанры"
                      loading={genresLoading}
                      className="rounded-lg"
                    >
                      {genres.map(genre => (
                        <Select.Option key={genre.id} value={genre.id}>
                          {genre.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              {/* Файлы */}
              <div className="space-y-6">
                <div className="bg-green-50/50 p-6 rounded-lg border border-green-100">
                  <Title level={4} className="flex items-center gap-2 !mb-4">
                    <FileTextOutlined className="text-green-500" />
                    Файлы
                  </Title>

                  <Form.Item 
                    label="Обложка книги"
                    extra={<Text type="secondary" className="text-xs">Поддерживаются JPG/PNG до 10MB</Text>}
                  >
                    <Dragger 
                      {...imageUploadProps}
                      className="bg-white border-2 border-dashed border-green-200 rounded-lg hover:border-green-400 transition-colors"
                      height={200}
                    >
                      {previewImage ? (
                        <div className="p-4">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="max-h-[150px] mx-auto object-contain"
                          />
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <InboxOutlined className="text-4xl text-green-500 mb-4" />
                          <p className="text-base mb-2">Нажмите или перетащите файл</p>
                          <p className="text-gray-400 text-sm">JPG/PNG до 10MB</p>
                        </div>
                      )}
                    </Dragger>
                  </Form.Item>

                  <Form.Item
                    label="Файл книги (PDF)"
                    required
                    extra={<Text type="secondary" className="text-xs">Поддерживаются только PDF файлы</Text>}
                  >
                    <Dragger 
                      {...pdfUploadProps}
                      className="bg-white border-2 border-dashed border-green-200 rounded-lg hover:border-green-400 transition-colors"
                    >
                      <div className="p-6 text-center">
                        <InboxOutlined className="text-4xl text-green-500 mb-4" />
                        <p className="text-base mb-2">Нажмите или перетащите файл PDF</p>
                        <p className="text-gray-400 text-sm">Только PDF формат</p>
                      </div>
                    </Dragger>
                  </Form.Item>
                </div>
              </div>
            </div>

            <Divider />

            <Form.Item className="mb-0 flex justify-end">
              <Space>
                <Button 
                  onClick={() => navigate(-1)}
                  className="min-w-[120px]"
                >
                  Отмена
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createBookMutation.isPending}
                  className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  Создать книгу
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </Flex>
  );
};

export default CreateBook;
