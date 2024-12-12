import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({
        data: createGenreDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Жанр с таким названием уже существует');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        books: true,
      },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException(`Жанр с ID ${id} не найден`);
    }

    return genre;
  }

  async update(id: number, updateData: Partial<CreateGenreDto>) {
    try {
      return await this.prisma.genre.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Жанр с ID ${id} не найден`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Жанр с таким названием уже существует');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.genre.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Жанр с ID ${id} не найден`);
      }
      throw error;
    }
  }

  async addGenreToBook(bookId: number, genreId: number) {
    try {
      return await this.prisma.book.update({
        where: { id: bookId },
        data: {
          genres: {
            connect: { id: genreId },
          },
        },
        include: {
          genres: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Книга или жанр не найдены');
      }
      throw error;
    }
  }

  async removeGenreFromBook(bookId: number, genreId: number) {
    try {
      return await this.prisma.book.update({
        where: { id: bookId },
        data: {
          genres: {
            disconnect: { id: genreId },
          },
        },
        include: {
          genres: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Книга или жанр не найдены');
      }
      throw error;
    }
  }
}
