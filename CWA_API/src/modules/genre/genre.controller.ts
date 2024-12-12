import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('genres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  async findAll() {
    return this.genreService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGenreDto: Partial<CreateGenreDto>,
  ) {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.remove(id);
  }

  @Post('book/:bookId/genre/:genreId')
  @UseGuards(JwtAuthGuard)
  async addGenreToBook(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('genreId', ParseIntPipe) genreId: number,
  ) {
    return this.genreService.addGenreToBook(bookId, genreId);
  }

  @Delete('book/:bookId/genre/:genreId')
  @UseGuards(JwtAuthGuard)
  async removeGenreFromBook(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('genreId', ParseIntPipe) genreId: number,
  ) {
    return this.genreService.removeGenreFromBook(bookId, genreId);
  }
}
