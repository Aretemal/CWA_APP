import { IsString, IsNumber, IsDate } from 'class-validator';

export class RefreshToken {
  @IsString()
  token: string;

  @IsNumber()
  userId: number;

  @IsDate()
  expiresAt: Date;
}
