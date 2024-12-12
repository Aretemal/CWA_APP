import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(
      createNotificationDto.title,
      createNotificationDto.description,
      req.user.id,
      createNotificationDto.recipients,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyNotifications(@Request() req) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }
}
