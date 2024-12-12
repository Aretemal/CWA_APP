import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Spin, Button, Tooltip, Modal, Form, Input, ColorPicker, message } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined,
  BookOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { pdfjs } from 'react-pdf';

import type { Bookmark, CreateBookmarkDto, UpdateBookmarkNoteDto } from '../../api/bookmarks';
import { useBookmarks, useCreateBookmark, useUpdateBookmarkNote, useDeleteBookmark, useUpdateBookmark } from '../../api/bookmarks';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PDFImageViewerProps {
  base64Data: string;
  bookId: number;
  initialPage?: number;
  onTextExtracted?: (text: string) => void;
}

interface BookmarkFormValues {
  title: string;
  note?: string;
  color: string;
}

interface ColorResult {
  metaColor: {
    r: number;
    g: number;
    b: number;
  };
}

const PDFImageViewer: React.FC<PDFImageViewerProps> = ({ 
  base64Data, 
  bookId,
  initialPage = 1,
  onTextExtracted
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);
  const [isBookmarkModalVisible, setIsBookmarkModalVisible] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [form] = Form.useForm();

  const { data: bookmarks = [] } = useBookmarks(bookId);
  const createBookmark = useCreateBookmark();
  const updateNote = useUpdateBookmarkNote();
  const deleteBookmark = useDeleteBookmark();
  const updateBookmark = useUpdateBookmark();

  const currentBookmark = bookmarks.find(b => b.pageNumber === pageNumber);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const nextPage = prevPageNumber + offset;
      if (nextPage >= 1 && nextPage <= numPages) {
        return nextPage;
      }
      return prevPageNumber;
    });
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handleAddBookmark = async (values: CreateBookmarkDto) => {
    try {
      await createBookmark.mutateAsync(values);
      setIsBookmarkModalVisible(false);
      form.resetFields();
      message.success('Закладка добавлена');
    } catch (error) {
      message.error('Ошибка при добавлении закладки');
    }
  };

  const handleUpdateNote = async (values: UpdateBookmarkNoteDto) => {
    if (!selectedBookmark) return;
    
    try {
      await updateNote.mutateAsync(values);
      setIsBookmarkModalVisible(false);
      setSelectedBookmark(null);
      form.resetFields();
      message.success('Заметка обновлена');
    } catch (error) {
      message.error('Ошибка при обновлении заметки');
    }
  };

  const handleDeleteBookmark = async (id: number) => {
    try {
      await deleteBookmark.mutateAsync(id);
      message.success('Закладка удалена');
    } catch (error) {
      message.error('Ошибка при удалении закладки');
    }
  };

  const handleFormSubmit = (values: BookmarkFormValues) => {
    const color = values.color as unknown as ColorResult;
    const hexColor = color?.metaColor ? 
      `#${[color.metaColor.r, color.metaColor.g, color.metaColor.b]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')}` : 
      '#3B82F6';

    if (selectedBookmark) {
      updateBookmark.mutateAsync({
        id: selectedBookmark.id,
        title: values.title,
        note: values.note,
        color: hexColor,
      }).then(() => {
        setIsBookmarkModalVisible(false);
        setSelectedBookmark(null);
        form.resetFields();
        message.success('Закладка обновлена');
      }).catch(() => {
        message.error('Ошибка при обновлении закладки');
      });
    } else {
      const createBookmarkData: CreateBookmarkDto = {
        title: values.title,
        note: values.note,
        color: hexColor,
        pageNumber,
        bookId,
      };
      handleAddBookmark(createBookmarkData);
    }
  };

  const onPageRenderSuccess = async (page: any) => {
    try {
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      onTextExtracted?.(text);
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  };

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  return (
    <div className="flex flex-col items-center max-w-7xl mx-auto">
      {/* Верхняя панель управления */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-4 z-50 w-full mb-6"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-indigo-100 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Навигация по страницам */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-2 rounded-xl">
              <Tooltip title="Предыдущая страница">
                <Button 
                  type="text"
                  shape="circle"
                  icon={<LeftOutlined />}
                  onClick={() => changePage(-1)} 
                  disabled={pageNumber <= 1}
                  className="hover:bg-indigo-100/50 transition-all duration-200 disabled:opacity-40"
                />
              </Tooltip>
              <div className="px-6 py-2 bg-white rounded-lg font-medium min-w-[120px] text-center shadow-sm">
                <span className="text-indigo-600">{pageNumber}</span>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-600">{numPages}</span>
              </div>
              <Tooltip title="Следующая страница">
                <Button 
                  type="text"
                  shape="circle"
                  icon={<RightOutlined />}
                  onClick={() => changePage(1)} 
                  disabled={pageNumber >= numPages}
                  className="hover:bg-indigo-100/50 transition-all duration-200 disabled:opacity-40"
                />
              </Tooltip>
            </div>

            {/* Управление масштабом */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-2 rounded-xl">
              <Tooltip title="Уменьшить">
                <Button 
                  type="text"
                  shape="circle"
                  icon={<ZoomOutOutlined />}
                  onClick={() => handleZoom(-0.1)}
                  disabled={scale <= 0.5}
                  className="hover:bg-blue-100/50 transition-all duration-200"
                />
              </Tooltip>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-blue-600">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <Tooltip title="Увеличить">
                <Button 
                  type="text"
                  shape="circle"
                  icon={<ZoomInOutlined />}
                  onClick={() => handleZoom(0.1)}
                  disabled={scale >= 2}
                  className="hover:bg-blue-100/50 transition-all duration-200"
                />
              </Tooltip>
            </div>

            {/* Закладка */}
            <div className="flex items-center bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-2 rounded-xl">
              {currentBookmark ? (
                <Tooltip title="Управление закладкой">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<BookOutlined className="text-lg" />}
                    onClick={() => {
                      setSelectedBookmark(currentBookmark);
                      form.setFieldsValue(currentBookmark);
                      setIsBookmarkModalVisible(true);
                    }}
                    className="hover:bg-teal-100/50 transition-all duration-200"
                    style={{ color: currentBookmark.color }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Добавить закладку">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<BookOutlined className="text-lg" />}
                    onClick={() => {
                      setSelectedBookmark(null);
                      form.resetFields();
                      setIsBookmarkModalVisible(true);
                    }}
                    className="hover:bg-teal-100/50 transition-all duration-200 text-teal-600"
                  />
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Контейнер для PDF */}
      <div className="relative bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full border border-indigo-100">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10 rounded-2xl"
            >
              <Spin size="large" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          key={pageNumber}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center"
        >
          <Document
            file={base64Data}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Spin size="large" />}
            error={
              <div className="text-red-500 p-8 text-center bg-red-50 rounded-xl">
                <p className="font-medium text-lg mb-2">Ошибка загрузки PDF</p>
                <p className="text-sm text-red-400">
                  Пожалуйста, проверьте файл и попробуйте снова
                </p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={<Spin size="large" />}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              onRenderSuccess={onPageRenderSuccess}
              className="shadow-lg rounded-lg overflow-hidden"
            />
          </Document>
        </motion.div>
      </div>

      {/* Модальное окно для закладок */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-lg bg-gradient-to-r from-indigo-50 to-blue-50 p-4 -mt-6 -mx-6 mb-4 border-b border-indigo-100">
            <BookOutlined className="text-indigo-500" />
            <span className="text-indigo-900">
              {selectedBookmark ? "Редактировать закладку" : "Добавить закладку"}
            </span>
          </div>
        }
        open={isBookmarkModalVisible}
        onCancel={() => {
          setIsBookmarkModalVisible(false);
          setSelectedBookmark(null);
          form.resetFields();
        }}
        footer={null}
        className="rounded-2xl overflow-hidden [&_.ant-modal-content]:rounded-2xl"
        width={480}
      >
        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
          className="mt-4"
          initialValues={selectedBookmark ? {
            title: selectedBookmark.title,
            note: selectedBookmark.note,
            color: selectedBookmark.color,
          } : undefined}
        >
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название закладки' }]}
          >
            <Input className="rounded-lg" />
          </Form.Item>

          <Form.Item name="color" label="Цвет">
            <ColorPicker 
              className="w-full"
              defaultValue={selectedBookmark?.color || '#3B82F6'}
              format="hex"
            />
          </Form.Item>
          
          <Form.Item name="note" label="Заметка">
            <Input.TextArea 
              rows={4} 
              className="rounded-lg"
              placeholder="Добавьте заметку к закладке..."
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            {selectedBookmark && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  handleDeleteBookmark(selectedBookmark.id);
                  setIsBookmarkModalVisible(false);
                  setSelectedBookmark(null);
                }}
                className="hover:bg-red-50"
              >
                Удалить
              </Button>
            )}
            <Button 
              type="primary" 
              htmlType="submit"
              loading={updateBookmark.isPending || createBookmark.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {selectedBookmark ? "Сохранить" : "Добавить"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PDFImageViewer; 