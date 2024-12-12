import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import { BookshelfService } from '../bookshelf/bookshelf.service';
import { FolderService } from '../folder/folder.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private bookshelfService: BookshelfService,
    private folderService: FolderService,
  ) {}

  async create(userData: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        role: userData.role || Role.USER,
      },
    });

    await Promise.all([
      this.bookshelfService.initializeUserBookshelves(user.id),
      this.folderService.initializeUserFolders(user.id),
    ]);

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        books: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        books: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
    return user;
  }

  async getUserInfo(id: number) {
    const user = await this.findById(id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async update(id: number, data: Partial<User>) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async countAdmins() {
    return this.prisma.user.count({
      where: {
        role: Role.ADMIN,
      },
    });
  }

  async delete(id: number): Promise<User> {
    await this.findById(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateRole(id: number, role: 'USER' | 'ADMIN') {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
