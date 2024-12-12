import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [JwtModule],
  controllers: [GenreController],
  providers: [GenreService, PrismaService],
  exports: [GenreService],
})
export class GenreModule {}
