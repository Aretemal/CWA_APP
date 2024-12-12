import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Используем email вместо username
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    console.log('User found:', user); // Логируем найденного пользователя
    if (!user) {
      throw new UnauthorizedException(); // Если пользователь не найден, выбрасываем исключение
    }
    return user; // Возвращаем пользователя
  }
}
