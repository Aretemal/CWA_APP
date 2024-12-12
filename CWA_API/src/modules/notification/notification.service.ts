import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
    creatorId: number,
  ) {
    const { title, description, recipients } = createNotificationDto;

    const notification = await this.prisma.notification.create({
      data: {
        title,
        description,
        creatorId,
        recipients,
      },
    });

    if (recipients === 'all') {
      // Создаем уведомления для всех пользователей
      const users = await this.prisma.user.findMany({
        where: { id: { not: creatorId } },
      });

      await this.prisma.userNotification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          notificationId: notification.id,
        })),
      });

      const notificationData = await this.prisma.userNotification.findFirst({
        where: { notificationId: notification.id },
        include: { notification: true },
      });

      // Отправляем уведомление через WebSocket
      this.notificationGateway.server.emit(
        'notification.created',
        notificationData,
      );
    } else {
      // Создаем уведомление для конкретного пользователя
      const userNotification = await this.prisma.userNotification.create({
        data: {
          userId: parseInt(recipients),
          notificationId: notification.id,
        },
        include: { notification: true },
      });

      // Отправляем уведомление через WebSocket конкретному пользователю
      this.notificationGateway.server
        .to(recipients)
        .emit('notification.created', userNotification);
    }

    return notification;
  }

  async findAll() {
    return this.prisma.userNotification.findMany({
      include: {
        notification: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findMyNotifications(userId: number) {
    return this.prisma.userNotification.findMany({
      where: {
        userId,
      },
      include: {
        notification: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getUnreadCount(userId: number) {
    return this.prisma.userNotification.count({
      where: {
        userId,
        viewed: false,
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.userNotification.update({
      where: {
        userId_notificationId: {
          userId,
          notificationId: id,
        },
      },
      data: {
        viewed: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      // Сначала удаляем все связанные записи в UserNotification
      await prisma.userNotification.deleteMany({
        where: {
          notificationId: id,
        },
      });

      // Затем удаляем само уведомление
      return prisma.notification.delete({
        where: { id },
      });
    });
  }
}
