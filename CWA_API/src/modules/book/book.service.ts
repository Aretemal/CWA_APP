import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import * as fs from 'fs/promises';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookWithWeight } from './types/book.types';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async findAll(genreIds?: number[]) {
    return this.prisma.book.findMany({
      where: genreIds
        ? {
            genres: {
              some: {
                id: {
                  in: genreIds,
                },
              },
            },
          }
        : undefined,
      include: {
        genres: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genres: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Книга не найдена');
    }

    return book;
  }

  async create(
    createBookDto: CreateBookDto,
    file: Express.Multer.File,
    userId: number,
    coverFile?: Express.Multer.File,
  ) {
    const book = await this.prisma.book.create({
      data: {
        ...createBookDto,
        filePath: file.path,
        imageUrl: coverFile ? coverFile.path : undefined,
        userId,
        genres: {
          connect: Array.isArray(createBookDto.genres)
            ? createBookDto.genres.map((id) => ({ id }))
            : [],
        },
      },
      include: {
        genres: true,
      },
    });
    return book;
  }

  async update(id: number, data: UpdateBookDto) {
    return this.prisma.book.update({
      where: { id },
      data: {
        ...data,
        genres: data.genres
          ? {
              set: [],
              connect: data.genres.map((id) => ({ id })),
              disconnect: data.genres.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        genres: true,
      },
    });
  }

  async remove(id: number) {
    const bookId = Number(id);

    if (isNaN(bookId)) {
      throw new Error('Invalid book ID');
    }

    await Promise.all([
      this.prisma.bookmark.deleteMany({
        where: { bookId },
      }),
      this.prisma.comment.deleteMany({
        where: { bookId },
      }),
      this.prisma
        .$executeRaw`DELETE FROM "_BookToBookshelf" WHERE "A" = ${bookId}`,
      this.prisma
        .$executeRaw`DELETE FROM "_BookToFolder" WHERE "A" = ${bookId}`,
      this.prisma.$executeRaw`DELETE FROM "_BookToGenre" WHERE "A" = ${bookId}`,
    ]);

    return this.prisma.book.delete({
      where: {
        id: bookId,
      },
    });
  }

  async getBookFile(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      select: {
        filePath: true,
        title: true,
      },
    });

    if (!book) {
      throw new NotFoundException('Книга не найдена');
    }

    if (!book.filePath) {
      throw new NotFoundException('Файл книги не найден');
    }

    return {
      path: book.filePath,
      filename: book.title,
    };
  }

  async downloadBookFile(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      select: {
        filePath: true,
        title: true,
      },
    });

    if (!book) {
      throw new NotFoundException('Книга не найдена');
    }

    if (!book.filePath) {
      throw new NotFoundException('Файл книги не найден');
    }

    try {
      const fileBuffer = await fs.readFile(book.filePath);
      return {
        buffer: fileBuffer,
        filename: book.title,
      };
    } catch (error) {
      console.error('Ошибка при чтении файла:', error);
      throw new NotFoundException('Ошибка при чтении файла книги');
    }
  }

  async getBooksByUserId(userId: number) {
    return this.prisma.book.findMany({
      where: { userId },
      include: {
        genres: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateCover(id: number, coverFilename: string) {
    const book = await this.prisma.book.update({
      where: { id },
      data: {
        imageUrl: `uploads/covers/${coverFilename}`,
      },
    });

    return book;
  }

  async getBookCover(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      select: {
        imageUrl: true,
        title: true,
      },
    });

    if (!book || !book.imageUrl) {
      throw new NotFoundException('Обложка книги не найдена');
    }

    const path = book.imageUrl.startsWith('/')
      ? book.imageUrl.slice(1)
      : book.imageUrl;
    const contentType = path.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const filename = `${book.title}-cover${path.substring(path.lastIndexOf('.'))}`;

    return {
      path,
      contentType,
      filename,
    };
  }

  async findAllWithWeights(
    userId: number,
    genreIds?: number[],
  ): Promise<BookWithWeight[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: true,
      },
    });

    const followingIds = user?.following.map((u) => u.id) || [];

    const books = await this.prisma.book.findMany({
      where: genreIds?.length
        ? {
            genres: {
              some: {
                id: {
                  in: genreIds,
                },
              },
            },
          }
        : undefined,
      include: {
        genres: true,
        user: true,
      },
    });

    const booksWithWeights = books.map((book) => {
      let weight = 1;

      if (followingIds.includes(book.userId)) {
        weight += 2;
      }

      return {
        ...book,
        weight,
      };
    });

    return booksWithWeights.sort((a, b) => b.weight - a.weight);
  }
}
