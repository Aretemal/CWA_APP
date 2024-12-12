import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import type { ChatMessage } from './types/chat.types';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets = new Map<number, string>();
  private adminSockets = new Set<string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.error('No token provided');
        throw new UnauthorizedException();
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.error(`User not found: ${userId}`);
        throw new UnauthorizedException();
      }

      this.userSockets.set(userId, client.id);
      client.data.userId = userId;
      client.data.isAdmin = user.role === 'ADMIN';

      if (user.role === 'ADMIN') {
        this.adminSockets.add(client.id);
      }

      this.logger.log(
        `Client connected: ${client.id}, User ID: ${userId}, Role: ${user.role}`,
      );
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId);
    }
    if (client.data.isAdmin) {
      this.adminSockets.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendMessage(userId: number, message: ChatMessage) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('message', { message });
    }
  }

  sendMessageToAdmins(message: ChatMessage) {
    this.adminSockets.forEach((socketId) => {
      this.server.to(socketId).emit('message', { message });
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    data: { content: string; chatId?: number },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const message = await this.chatService.createMessage(
      { content: data.content, chatId: data.chatId },
      user,
    );

    if (user.role === 'ADMIN') {
      // Отправляем сообщение пользователю
      this.sendMessage(data.chatId!, message);
    } else {
      // Отправляем сообщение всем админам и пользователю
      this.sendMessageToAdmins(message);
      this.sendMessage(userId, message);
    }
  }

  @SubscribeMessage('loadMessages')
  async handleLoadMessages(client: Socket, data: { userId?: number }) {
    const userId = client.data.userId;
    if (!userId) return;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const messages = data.userId
      ? await this.chatService.findOrCreateChat(data.userId, user)
      : await this.chatService.findMyMessages(userId);

    client.emit('messages', { messages });
  }
}
