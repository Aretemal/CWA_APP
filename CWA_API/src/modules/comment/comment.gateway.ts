import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { WsJwtAuthGuard } from '../auth/ws-jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
  namespace: 'comments',
})
@UseGuards(WsJwtAuthGuard)
export class CommentGateway {
  @WebSocketServer()
  server: Server;

  constructor(private commentService: CommentService) {}

  @SubscribeMessage('joinBook')
  async handleJoinBook(
    @MessageBody() bookId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`book-${bookId}`);
    const comments = await this.commentService.findByBook(bookId);
    return comments;
  }

  @SubscribeMessage('leaveBook')
  handleLeaveBook(
    @MessageBody() bookId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`book-${bookId}`);
  }

  @SubscribeMessage('createComment')
  async handleCreateComment(
    @MessageBody() createCommentDto: CreateCommentDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    const comment = await this.commentService.create(createCommentDto, user.id);

    this.server.to(`book-${createCommentDto.bookId}`).emit('newComment', {
      ...comment,
      user: {
        id: user.id,
        name: user.name,
      },
    });

    return comment;
  }

  @SubscribeMessage('deleteComment')
  async handleDeleteComment(
    @MessageBody() commentId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    const comment = await this.commentService.remove(commentId, user);

    if (comment) {
      this.server
        .to(`book-${comment.bookId}`)
        .emit('commentDeleted', commentId);
    }

    return comment;
  }
}
