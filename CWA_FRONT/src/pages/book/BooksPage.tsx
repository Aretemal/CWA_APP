import React from 'react';
import { List, Card } from 'antd';
import { Link } from 'react-router-dom';

const BooksPage: React.FC<{ books: any[] }> = ({ books }) => {
  return (
    <List
      dataSource={books}
      renderItem={(book) => (
        <List.Item>
          <Link to={`/books/${book.id}`}>
            <Card>
              <h3>{book.title}</h3>
              {/* другая информация о книге */}
            </Card>
          </Link>
        </List.Item>
      )}
    />
  );
};

export default BooksPage; 