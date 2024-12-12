import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsHexColor,
} from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(1)
  pageNumber: number;

  @IsNumber()
  bookId: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
