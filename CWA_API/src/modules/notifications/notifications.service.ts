import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: number) {
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

  async create(
    title: string,
    description: string,
    creatorId: number,
    recipients: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        title,
        description,
        creatorId,
        recipients,
      },
    });

    if (recipients === 'all') {
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            not: creatorId,
          },
        },
        select: {
          id: true,
        },
      });

      await this.prisma.userNotification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          notificationId: notification.id,
          viewed: false,
        })),
      });
    } else {
      const recipientId = parseInt(recipients);
      if (!isNaN(recipientId)) {
        await this.prisma.userNotification.create({
          data: {
            userId: recipientId,
            notificationId: notification.id,
            viewed: false,
          },
        });
      }
    }

    return notification;
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.userNotification.updateMany({
      where: {
        notificationId,
        userId,
      },
      data: {
        viewed: true,
      },
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.userNotification.count({
      where: {
        userId,
        viewed: false,
      },
    });
  }
}
