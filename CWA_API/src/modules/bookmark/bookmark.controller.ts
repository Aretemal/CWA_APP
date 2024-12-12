import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  async create(@Request() req, @Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.create(createBookmarkDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req) {
    return this.bookmarkService.findAll(req.user.id);
  }

  @Get('book/:bookId')
  async findByBook(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Request() req,
  ) {
    return this.bookmarkService.findByBook(bookId, req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.bookmarkService.findOne(id, req.user.id);
  }

  @Patch(':id/note')
  async updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body('note') note: string,
    @Request() req,
  ) {
    return this.bookmarkService.updateNote(id, note, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookmarkDto: Partial<CreateBookmarkDto>,
    @Request() req,
  ) {
    return this.bookmarkService.update(id, updateBookmarkDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.bookmarkService.remove(id, req.user.id);
  }
}
