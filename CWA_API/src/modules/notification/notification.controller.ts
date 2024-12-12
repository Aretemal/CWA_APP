import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async create(
    @Request() req,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    console.log('Creating notification:', createNotificationDto);
    const notification = await this.notificationService.create(
      createNotificationDto,
      req.user.id,
    );

    console.log('Created notification:', notification);

    this.eventEmitter.emit('notification.created', notification);
    console.log('Emitted notification event');

    return notification;
  }

  @Get()
  async findAll() {
    console.log('Getting all notifications');
    const notifications = await this.notificationService.findAll();
    console.log('Found notifications:', notifications);
    return notifications;
  }

  @Get('my')
  findMyNotifications(@Request() req) {
    return this.notificationService.findMyNotifications(req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Patch(':id/mark-as-read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.notificationService.remove(id);
      return { success: true, message: 'Уведомление успешно удалено' };
    } catch (error) {
      console.error('Error removing notification:', error);
      throw new Error('Не удалось удалить уведомление');
    }
  }
}
