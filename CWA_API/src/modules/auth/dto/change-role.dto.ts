import { IsNumber, IsEnum } from 'class-validator';

import { Role } from '../../../common/enums/role.enum';

export class ChangeRoleDto {
  @IsNumber()
  userId: number;

  @IsEnum(Role)
  role: Role;
}
