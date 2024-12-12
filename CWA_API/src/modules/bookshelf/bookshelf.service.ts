import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BookshelfType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookshelfService {
  constructor(private prisma: PrismaService) {}

  async initializeUserBookshelves(userId: number) {
    const types = Object.values(BookshelfType);

    // Сначала проверим существующие полки
    const existingShelves = await this.prisma.bookshelf.findMany({
      where: {
        userId,
      },
      select: {
        type: true,
      },
    });

    const existingTypes = existingShelves.map((shelf) => shelf.type);
    const typesToCreate = types.filter((type) => !existingTypes.includes(type));

    // Создаем только отсутствующие полки
    if (typesToCreate.length > 0) {
      await Promise.all(
        typesToCreate.map((type) =>
          this.prisma.bookshelf.create({
            data: {
              userId,
              type,
            },
          }),
        ),
      );
    }

    return this.prisma.bookshelf.findMany({
      where: {
        userId,
      },
      include: {
        books: true,
        _count: {
          select: {
            books: true,
          },
        },
      },
    });
  }

  async addBookToShelf(
    userId: number,
    bookId: number,
    shelfType: BookshelfType,
  ) {
    const existingShelf = await this.prisma.bookshelf.findFirst({
      where: {
        userId,
        books: {
          some: {
            id: bookId,
          },
        },
      },
    });

    if (existingShelf) {
      await this.prisma.bookshelf.update({
        where: { id: existingShelf.id },
        data: {
          books: {
            disconnect: { id: bookId },
          },
        },
      });
    }

    const shelf = await this.prisma.bookshelf.findFirst({
      where: {
        userId,
        type: shelfType,
      },
    });

    if (!shelf) {
      throw new NotFoundException('Полка не найдена');
    }

    return this.prisma.bookshelf.update({
      where: { id: shelf.id },
      data: {
        books: {
          connect: { id: bookId },
        },
      },
      include: {
        books: {
          include: {
            genres: true,
          },
        },
      },
    });
  }

  async removeBookFromShelf(
    userId: number,
    bookId: number,
    shelfType: BookshelfType,
  ) {
    const shelf = await this.prisma.bookshelf.findFirst({
      where: {
        userId,
        type: shelfType,
      },
    });

    if (!shelf) {
      throw new NotFoundException('Полка не найдена');
    }

    return this.prisma.bookshelf.update({
      where: { id: shelf.id },
      data: {
        books: {
          disconnect: { id: bookId },
        },
      },
    });
  }

  async getUserBookshelves(userId: number) {
    return this.prisma.bookshelf.findMany({
      where: { userId },
      include: {
        books: {
          include: {
            genres: true,
          },
        },
        _count: {
          select: {
            books: true,
          },
        },
      },
      orderBy: {
        type: 'asc',
      },
    });
  }

  async getBookshelfBooks(userId: number, shelfType: BookshelfType) {
    const shelf = await this.prisma.bookshelf.findFirst({
      where: {
        userId,
        type: shelfType,
      },
      include: {
        books: {
          include: {
            genres: true,
          },
        },
      },
    });

    if (!shelf) {
      throw new NotFoundException('Полка не найдена');
    }

    return shelf.books;
  }

  async getBookCurrentShelf(userId: number, bookId: number) {
    const shelf = await this.prisma.bookshelf.findFirst({
      where: {
        userId,
        books: {
          some: {
            id: bookId,
          },
        },
      },
    });

    return shelf?.type;
  }
}
