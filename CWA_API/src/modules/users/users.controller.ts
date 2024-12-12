import { Controller, Get, UseGuards, Request } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }
}
