// user.controller.ts

import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Request,
  Body,
  Patch,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('role/:id')
  @UseGuards(JwtAuthGuard)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: 'USER' | 'ADMIN',
  ) {
    return this.userService.updateRole(id, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
