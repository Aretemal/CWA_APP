import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  chatId?: number;
}
