import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
  ConflictException,
  Query,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post(':userId')
  async follow(@Request() req, @Param('userId', ParseIntPipe) userId: number) {
    if (req.user.id === userId) {
      throw new ConflictException('Нельзя подписаться на самого себя');
    }
    return this.subscriptionService.follow(req.user.id, userId);
  }

  @Delete(':userId')
  async unfollow(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.subscriptionService.unfollow(req.user.id, userId);
  }

  @Get('followers')
  async getFollowers(@Request() req) {
    return this.subscriptionService.getFollowers(req.user.id);
  }

  @Get('following')
  async getFollowing(@Request() req) {
    return this.subscriptionService.getFollowing(req.user.id);
  }

  @Get('check/:userId')
  async checkFollowing(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.subscriptionService.checkFollowing(req.user.id, userId);
  }

  @Get('search')
  async searchUsers(@Request() req, @Query('search') searchTerm: string = '') {
    return this.subscriptionService.searchUsers(searchTerm, req.user.id);
  }
}
