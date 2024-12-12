import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: number, followingId: number) {
    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          connect: { id: followingId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            books: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  async unfollow(followerId: number, followingId: number) {
    return this.prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          disconnect: { id: followingId },
        },
      },
    });
  }

  async getFollowers(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        followers: {
          select: {
            id: true,
            name: true,
            email: true,
            books: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return user?.followers || [];
  }

  async getFollowing(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            books: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return user?.following || [];
  }

  async checkFollowing(followerId: number, followingId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: followerId,
        following: {
          some: {
            id: followingId,
          },
        },
      },
    });

    return !!user;
  }

  async searchUsers(searchTerm: string, currentUserId: number) {
    const where: Prisma.UserWhereInput = {
      AND: [
        ...(searchTerm
          ? [
              {
                OR: [
                  {
                    name: {
                      contains: searchTerm,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    email: {
                      contains: searchTerm,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
            ]
          : []),
        { id: { not: currentUserId } },
      ],
    };

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        books: {
          take: 3,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            author: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            books: true,
            followers: true,
          },
        },
      },
    });

    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const isFollowing = await this.checkFollowing(currentUserId, user.id);
        return {
          ...user,
          isFollowing,
        };
      }),
    );

    return usersWithFollowStatus;
  }
}
