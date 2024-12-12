import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangeRoleDto } from './dto/change-role.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('admin-action')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async adminOnlyAction() {
    return { message: 'This action is only for admins' };
  }

  @Patch('change-role')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async changeUserRole(@Body() changeRoleDto: ChangeRoleDto) {
    return this.authService.changeUserRole(changeRoleDto);
  }
}
