import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsOptional()
  @Transform(({ value }) => (value ? JSON.parse(value).map(Number) : []))
  genres?: number[];
}
