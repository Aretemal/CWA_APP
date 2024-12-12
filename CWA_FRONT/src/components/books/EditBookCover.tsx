import React, { useState } from 'react';
import { Modal, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useUpdateBookCover } from '../../api/books';
import type { UploadFile } from 'antd/lib/upload/interface';

interface Props {
  bookId: number;
  currentCover?: string;
  onSuccess?: () => void;
}

const EditBookCover: React.FC<Props> = ({ bookId, currentCover, onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null);
  const updateCover = useUpdateBookCover();

  const handleCoverChange = ({ file }: { file: UploadFile }) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Можно загружать только JPG/PNG файлы!');
      return;
    }

    if (!file.size) {
      message.error('Не удалось определить размер файла');
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error('Изображение должно быть меньше 10MB!');
      return;
    }

    setCoverFile(file);
  };

  const handleSave = async () => {
    if (!coverFile?.originFileObj) return;

    try {
      await updateCover.mutateAsync({
        bookId,
        coverFile: coverFile.originFileObj,
      });
      message.success('Обложка обновлена');
      setIsModalVisible(false);
      onSuccess?.();
    } catch (error) {
      message.error('Ошибка при обновлении обложки');
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalVisible(true)}
        className="cursor-pointer group relative"
      >
        {currentCover ? (
          <img
            src={currentCover}
            alt="Обложка"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <PlusOutlined className="text-2xl text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white">Изменить обложку</span>
        </div>
      </div>

      <Modal
        title="Изменить обложку"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okButtonProps={{ loading: updateCover.isPending }}
      >
        <Upload
          listType="picture-card"
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleCoverChange}
        >
          {coverFile ? (
            <img
              src={URL.createObjectURL(coverFile.originFileObj as Blob)}
              alt="Превью"
              className="w-full h-full object-cover"
            />
          ) : (
            <div>
              <PlusOutlined />
              <div className="mt-2">Загрузить</div>
            </div>
          )}
        </Upload>
      </Modal>
    </>
  );
};

export default EditBookCover; 