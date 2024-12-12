import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        bookId: createCommentDto.bookId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return comment;
  }

  async findByBook(bookId: number) {
    return this.prisma.comment.findMany({
      where: { bookId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: number, user: any) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (comment.userId !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException(
        'У вас нет прав на удаление этого комментария',
      );
    }

    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
