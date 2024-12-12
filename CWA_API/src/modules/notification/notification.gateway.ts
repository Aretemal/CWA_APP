import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { UserNotification } from '@prisma/client';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.connectedClients.delete(client.id);
  }

  @OnEvent('notification.created')
  handleNotificationCreated(
    notification: UserNotification & {
      notification: { title: string; description: string };
    },
  ) {
    console.log('Broadcasting notification:', notification);
    this.server.emit('notification.created', notification);
  }
}
