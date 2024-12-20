import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    this.logger.debug(`User: ${JSON.stringify(user)}`);
    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!user) {
      this.logger.error('No user found in request');
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    this.logger.debug(`Has required role: ${hasRole}`);

    return hasRole;
  }
}
