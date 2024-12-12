import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client'; // Импортируйте модель User
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service'; // Импортируйте UserService
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { Role } from '../../common/enums/role.enum';
import { BookshelfService } from '../bookshelf/bookshelf.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private bookshelfService: BookshelfService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.userService.validatePassword(user, password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    console.log('Login user data:', user); // Добавим для отладки
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role, // Убедимся, что роль включена в payload
    };

    console.log('JWT payload:', payload); // Добавим для отладки

    const token = this.jwtService.sign(payload);
    console.log('Generated token:', token); // Добавим для отладки

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.login(user);
  }

  async changeUserRole(changeRoleDto: ChangeRoleDto) {
    const user = await this.userService.findById(changeRoleDto.userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем, не пытается ли кто-то изменить роль последнего админа
    if (user.role === Role.ADMIN) {
      const adminCount = await this.userService.countAdmins();
      if (adminCount === 1 && changeRoleDto.role !== Role.ADMIN) {
        throw new ForbiddenException(
          'Невозможно удалить роль у последнего администратора',
        );
      }
    }

    const updatedUser = await this.userService.update(user.id, {
      role: changeRoleDto.role,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  }
}
