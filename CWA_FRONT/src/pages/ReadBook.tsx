import React, { useState, useEffect } from 'react';
import { Layout, Typography, Spin, Button, Drawer, Space, message, List, Tag, Empty } from 'antd';
import { 
  ArrowLeftOutlined, 
  MenuOutlined, 
  BookOutlined, 
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  TranslationOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PDFImageViewer from '../components/common/PDFImageViewer';
import { useBook, useBookPDF } from '../api/books';
import { useBookmarks, useDeleteBookmark } from '../api/bookmarks';
import { BookReader } from '../components/book/BookReader';
import * as pdfjsLib from 'pdfjs-dist';

const { Title, Text } = Typography;
const { Content } = Layout;

// Инициализируем worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ReadBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [translationVisible, setTranslationVisible] = useState(false);
  const [pageText, setPageText] = useState<string>('');
  
  const bookId = Number(id);
  const { data: book, isLoading: bookLoading, error: bookError } = useBook(bookId);
  const { data: pdfBlob, isLoading: pdfLoading, error: pdfError } = useBookPDF(id || '');

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks(bookId);
  const deleteBookmark = useDeleteBookmark();

  const handleDeleteBookmark = async (id: number) => {
    try {
      await deleteBookmark.mutateAsync(id);
      message.success('Закладка удалена');
    } catch (error) {
      message.error('Ошибка при удалении закладки');
    }
  };

  const isLoading = bookLoading || pdfLoading;
  const error = bookError || pdfError;

  useEffect(() => {
    if (pdfBlob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfUrl(reader.result as string);
      };
      reader.readAsDataURL(pdfBlob);
    }
  }, [pdfBlob]);

  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setPdfUrl(null);
      setPageNumber(Number(page));
    }
  }, [searchParams]);

  useEffect(() => {
    if (pageNumber > 1) {
      setSearchParams({ page: pageNumber.toString() });
    } else {
      setSearchParams({});
    }
  }, [pageNumber, setSearchParams]);

  useEffect(() => {
    if (book) {
      console.log('Book content:', book.content);
    }
  }, [book]);

  const handleTextExtracted = (text: string) => {
    setPageText(text);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при загрузке книги';
    message.error(errorMessage);
    navigate('/books');
    return null;
  }
  console.log('Book content:',pageText);
  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Верхняя панель */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Левая часть с названием и навигацией */}
            <div className="flex items-center gap-4">
              <Button 
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/books')}
                className="hover:bg-gray-50"
              >
                Назад
              </Button>
              <div className="flex items-center gap-3">
                <BookOutlined className="text-2xl text-blue-500" />
                <Title level={4} className="!m-0 !text-gray-800">
                  {book?.title}
                </Title>
              </div>
            </div>

            {/* Правая часть с действиями */}
            <Space size="middle">
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={() => {
                  if (pdfUrl) {
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = `${book?.title || 'book'}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                className="hover:bg-gray-50"
              >
                Скачать PDF
              </Button>
              <Button
                type="default"
                icon={<TranslationOutlined />}
                onClick={() => setTranslationVisible(true)}
                className="hover:bg-gray-50"
              >
                Перевод
              </Button>
              <Button
                type="primary"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Закладки
              </Button>
            </Space>
          </div>
        </div>
      </motion.div>

      {/* Основной контент */}
      <Content className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-transparent">
            {pdfUrl && (
              <PDFImageViewer 
                base64Data={pdfUrl} 
                bookId={bookId} 
                initialPage={pageNumber}
                onTextExtracted={handleTextExtracted}
              />
            )}
          </div>
        </motion.div>
      </Content>

      {/* Боковая панель закладок */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <BookOutlined className="text-blue-500" />
            <span>Закладки</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={320}
        className="p-0"
        bodyStyle={{ padding: 0 }}
      >
        {bookmarksLoading ? (
          <div className="flex justify-center p-8">
            <Spin />
          </div>
        ) : bookmarks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Нет закладок"
            className="my-8"
          />
        ) : (
          <List
            dataSource={bookmarks}
            renderItem={(bookmark) => (
              <List.Item
                className="hover:bg-blue-50/50 transition-colors cursor-pointer px-4 py-3 border-b last:border-b-0"
                onClick={() => {
                  // Переход к странице с закладкой
                  if (pdfUrl) {
                    const viewer = document.querySelector('.react-pdf__Page') as HTMLElement;
                    if (viewer) {
                      viewer.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                  setDrawerVisible(false);
                }}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBookmark(bookmark.id);
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Tag 
                      color={bookmark.color || '#3B82F6'} 
                      className="min-w-[40px] text-center font-medium"
                    >
                      {bookmark.pageNumber}
                    </Tag>
                  }
                  title={
                    <span className="font-medium text-gray-800">
                      {bookmark.title}
                    </span>
                  }
                  description={
                    bookmark.note && (
                      <Text 
                        type="secondary" 
                        className="text-sm line-clamp-2 text-gray-500"
                      >
                        {bookmark.note}
                      </Text>
                    )
                  }
                />
              </List.Item>
            )}
            className="[&_.ant-list-item-meta-title]:!mb-1 [&_.ant-tag]:!mr-3 divide-y divide-gray-100"
          />
        )}
      </Drawer>

      {/* Drawer для перевода */}
      <Drawer
        title="Перевод текста"
        placement="right"
        width={600}
        onClose={() => setTranslationVisible(false)}
        open={translationVisible}
      >
        {pageText ? (
          <BookReader content={pageText} />
        ) : (
          <Empty description="Текст для перевода недоступен" />
        )}
      </Drawer>
    </Layout>
  );
};

export default ReadBook;