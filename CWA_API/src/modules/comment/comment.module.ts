import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CommentService } from './comment.service';
import { CommentGateway } from './comment.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { WsJwtAuthGuard } from '../auth/ws-jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CommentGateway, CommentService, PrismaService, WsJwtAuthGuard],
  exports: [CommentService],
})
export class CommentModule {}
