import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async create(createBookmarkDto: CreateBookmarkDto, userId: number) {
    const book = await this.prisma.book.findUnique({
      where: { id: createBookmarkDto.bookId },
    });

    if (!book) {
      throw new NotFoundException('Книга не найдена');
    }

    // Проверяем, есть ли уже закладка на этой странице
    const existingBookmark = await this.prisma.bookmark.findFirst({
      where: {
        userId,
        bookId: createBookmarkDto.bookId,
        pageNumber: createBookmarkDto.pageNumber,
      },
    });

    if (existingBookmark) {
      throw new ForbiddenException('Закладка на этой странице уже существует');
    }

    return this.prisma.bookmark.create({
      data: {
        ...createBookmarkDto,
        userId,
        color: createBookmarkDto.color || '#3B82F6', // Дефолтный синий цвет
      },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Закладка не найдена');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этой закладке');
    }

    return bookmark;
  }

  async update(
    id: number,
    updateData: Partial<CreateBookmarkDto>,
    userId: number,
  ) {
    await this.findOne(id, userId); // Проверяем существование и права доступа

    return this.prisma.bookmark.update({
      where: { id },
      data: updateData,
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId); // Проверяем существование и права доступа

    return this.prisma.bookmark.delete({
      where: { id },
    });
  }

  async findByBook(bookId: number, userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        bookId,
        userId,
      },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: [{ pageNumber: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async updateNote(id: number, note: string, userId: number) {
    const bookmark = await this.findOne(id, userId);

    if (!bookmark) {
      throw new NotFoundException('Закладка не найдена');
    }

    return this.prisma.bookmark.update({
      where: { id },
      data: { note },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    });
  }
}
