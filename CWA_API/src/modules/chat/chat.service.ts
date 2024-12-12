import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatEvents } from './chat.events';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatEvents: ChatEvents,
  ) {}

  async findAllUsers(search?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'USER',
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOrCreateChat(userId: number, admin: User) {
    let chat = await this.prisma.chat.findFirst({
      where: { userId },
      include: {
        messages: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          userId,
          messages: {
            create: {
              content: 'Добро пожаловать! Чем могу помочь?',
              userId: admin.id,
              isAdmin: true,
            },
          },
        },
        include: {
          messages: {
            include: { user: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // Отмечаем все сообщения как прочитанные для админа
    if (admin.role === 'ADMIN') {
      await this.prisma.message.updateMany({
        where: {
          chatId: chat.id,
          isAdmin: false,
          viewed: false,
        },
        data: {
          viewed: true,
        },
      });
    }

    return chat.messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    }));
  }

  async findMyMessages(userId: number) {
    let chat = await this.prisma.chat.findFirst({
      where: { userId },
      include: {
        messages: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          userId,
          messages: {
            create: {
              content: 'Добро пожаловать! Чем могу помочь?',
              userId: 1, // ID админа
              isAdmin: true,
            },
          },
        },
        include: {
          messages: {
            include: { user: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // Отмечаем все сообщения как прочитанные для пользователя
    await this.prisma.message.updateMany({
      where: {
        chatId: chat.id,
        isAdmin: true,
        viewed: false,
      },
      data: {
        viewed: true,
      },
    });

    return chat.messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    }));
  }

  async createMessage(createMessageDto: CreateMessageDto, user: User) {
    try {
      // Находим или создаем чат
      let chat = await this.prisma.chat.findFirst({
        where: {
          userId: user.role === 'ADMIN' ? createMessageDto.chatId : user.id,
        },
        include: {
          user: true,
        },
      });

      if (!chat) {
        // Проверяем существование пользователя перед созданием чата
        const chatUser = await this.prisma.user.findUnique({
          where: {
            id: user.role === 'ADMIN' ? createMessageDto.chatId! : user.id,
          },
        });

        if (!chatUser) {
          throw new NotFoundException('Пользователь не найден');
        }

        chat = await this.prisma.chat.create({
          data: {
            userId: user.role === 'ADMIN' ? createMessageDto.chatId! : user.id,
          },
          include: {
            user: true,
          },
        });
      }

      // Создаем сообщение в транзакции
      const [message] = await this.prisma.$transaction([
        this.prisma.message.create({
          data: {
            content: createMessageDto.content.trim(),
            chatId: chat.id,
            userId: user.id,
            isAdmin: user.role === 'ADMIN',
          },
          include: {
            user: true,
          },
        }),
        // Обновляем время последнего сообщения в чате
        this.prisma.chat.update({
          where: { id: chat.id },
          data: { updatedAt: new Date() },
        }),
      ]);

      const formattedMessage = {
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      };

      // Отправляем уведомление через WebSocket
      this.chatEvents.emitMessage(chat.userId, formattedMessage);

      return formattedMessage;
    } catch (error) {
      this.logger.error('Error creating message:', error);
      throw new Error('Не удалось отправить сообщение');
    }
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.message.count({
      where: {
        chat: { userId },
        isAdmin: true,
        viewed: false,
      },
    });

    return count;
  }
}
