import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

interface GenreStat {
  id: number;
  count: string | number;
  bookmark_count: string | number;
}

interface AuthorStat {
  name: string;
  count: string | number;
  bookmark_count: string | number;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: number) {
    // Получаем статистику по жанрам
    const genreStats = await this.prisma.$queryRaw<GenreStat[]>`
      SELECT 
        g.id,
        COUNT(DISTINCT b.id) as count,
        COUNT(DISTINCT bm.id) as bookmark_count
      FROM "Genre" g
      LEFT JOIN "_BookToGenre" bg ON g.id = bg."B"
      LEFT JOIN "Book" b ON bg."A" = b.id AND b."userId" = ${userId}
      LEFT JOIN "Bookmark" bm ON b.id = bm."bookId" AND bm."userId" = ${userId}
      GROUP BY g.id
    `;

    // Получаем статистику по авторам
    const authorStats = await this.prisma.$queryRaw<AuthorStat[]>`
      SELECT 
        b.author as name,
        COUNT(DISTINCT b.id) as count,
        COUNT(DISTINCT bm.id) as bookmark_count
      FROM "Book" b
      LEFT JOIN "Bookmark" bm ON b.id = bm."bookId" AND bm."userId" = ${userId}
      WHERE b."userId" = ${userId}
      GROUP BY b.author
    `;

    return {
      genreStats: genreStats.map((stat) => ({
        id: stat.id,
        count: Number(stat.count),
        bookmarkCount: Number(stat.bookmark_count),
      })),
      authorStats: authorStats.map((stat) => ({
        name: stat.name,
        count: Number(stat.count),
        bookmarkCount: Number(stat.bookmark_count),
      })),
    };
  }
}
