import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_FOLDER_TYPES } from '../../constants/folderTypes';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  async initializeUserFolders(userId: number) {
    await Promise.all(
      DEFAULT_FOLDER_TYPES.map((name) =>
        this.prisma.folder.create({
          data: {
            name,
            userId,
          },
        }),
      ),
    );
  }

  async create(userId: number, name: string) {
    try {
      return await this.prisma.folder.create({
        data: {
          name,
          userId,
        },
        include: {
          books: {
            include: {
              genres: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Папка с таким именем уже существует');
      }
      throw error;
    }
  }

  async getUserFolders(userId: number) {
    return this.prisma.folder.findMany({
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
    });
  }

  async update(userId: number, folderId: number, name: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new NotFoundException('Папка не найдена');
    }

    try {
      return await this.prisma.folder.update({
        where: { id: folderId },
        data: { name },
        include: {
          books: {
            include: {
              genres: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Папка с таким именем уже существует');
      }
      throw error;
    }
  }

  async delete(userId: number, folderId: number) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new NotFoundException('Папка не найдена');
    }

    return this.prisma.folder.delete({
      where: { id: folderId },
    });
  }

  async addBook(userId: number, folderId: number, bookId: number) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new NotFoundException('Папка не найдена');
    }

    return this.prisma.folder.update({
      where: { id: folderId },
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

  async removeBook(userId: number, folderId: number, bookId: number) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new NotFoundException('Папка не найдена');
    }

    return this.prisma.folder.update({
      where: { id: folderId },
      data: {
        books: {
          disconnect: { id: bookId },
        },
      },
    });
  }
}
