import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FolderService } from './folder.service';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  create(@Request() req, @Body('name') name: string) {
    return this.folderService.create(req.user.id, name);
  }

  @Get()
  getUserFolders(@Request() req) {
    return this.folderService.getUserFolders(req.user.id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name: string,
  ) {
    return this.folderService.update(req.user.id, id, name);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.folderService.delete(req.user.id, id);
  }

  @Post(':folderId/books/:bookId')
  addBook(
    @Request() req,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return this.folderService.addBook(req.user.id, folderId, bookId);
  }

  @Delete(':folderId/books/:bookId')
  removeBook(
    @Request() req,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return this.folderService.removeBook(req.user.id, folderId, bookId);
  }
}
