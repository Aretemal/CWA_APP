import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseEnumPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BookshelfType } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookshelfService } from './bookshelf.service';

@Controller('bookshelves')
@UseGuards(JwtAuthGuard)
export class BookshelfController {
  constructor(private readonly bookshelfService: BookshelfService) {}

  @Get()
  getUserBookshelves(@Request() req) {
    return this.bookshelfService.getUserBookshelves(req.user.id);
  }

  @Get('user/:userId')
  getOtherUserBookshelves(@Param('userId', ParseIntPipe) userId: number) {
    return this.bookshelfService.getUserBookshelves(userId);
  }

  @Get(':type')
  getBookshelfBooks(
    @Request() req,
    @Param('type', new ParseEnumPipe(BookshelfType)) type: BookshelfType,
  ) {
    return this.bookshelfService.getBookshelfBooks(req.user.id, type);
  }

  @Post(':type/books/:bookId')
  addBookToShelf(
    @Request() req,
    @Param('type', new ParseEnumPipe(BookshelfType)) type: BookshelfType,
    @Param('bookId') bookId: string,
  ) {
    return this.bookshelfService.addBookToShelf(req.user.id, +bookId, type);
  }

  @Delete(':type/books/:bookId')
  removeBookFromShelf(
    @Request() req,
    @Param('type', new ParseEnumPipe(BookshelfType)) type: BookshelfType,
    @Param('bookId') bookId: string,
  ) {
    return this.bookshelfService.removeBookFromShelf(
      req.user.id,
      +bookId,
      type,
    );
  }
}
