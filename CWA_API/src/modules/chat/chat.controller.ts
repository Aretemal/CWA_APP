import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('users')
  @Roles(Role.ADMIN)
  findAllUsers(@Query('search') search?: string) {
    return this.chatService.findAllUsers(search);
  }

  @Get('messages')
  findMyMessages(@Request() req) {
    return this.chatService.findMyMessages(req.user.id);
  }

  @Get('messages/:userId')
  @Roles(Role.ADMIN)
  findOrCreateChat(@Request() req, @Query('userId') userId: string) {
    return this.chatService.findOrCreateChat(+userId, req.user);
  }

  @Post('messages')
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.chatService.createMessage(createMessageDto, req.user);
  }

  @Get('unread')
  getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }
}
