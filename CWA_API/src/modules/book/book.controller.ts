import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Res,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { createReadStream } from 'fs';

import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookWithWeight } from './types/book.types';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyBooks(@Request() req) {
    const userId = req.user.id;
    return this.bookService.getBooksByUserId(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req,
    @Query('genres') genres?: string,
  ): Promise<BookWithWeight[]> {
    const genreIds = genres ? genres.split(',').map(Number) : undefined;
    return this.bookService.findAllWithWeights(req.user.id, genreIds);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.bookService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при получении книги');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath =
              file.fieldname === 'cover' ? './uploads/covers' : './uploads';
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              file.fieldname +
                '-' +
                uniqueSuffix +
                '.' +
                file.originalname.split('.').pop(),
            );
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'cover') {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
              return cb(new Error('Only image files are allowed!'), false);
            }
          } else {
            if (file.mimetype !== 'application/pdf') {
              return cb(new Error('Only PDF files are allowed!'), false);
            }
          }
          cb(null, true);
        },
      },
    ),
  )
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles()
    files: { file: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Request() req,
  ) {
    const bookFile = files.file[0];
    const coverFile = files.cover?.[0];

    return this.bookService.create(
      createBookDto,
      bookFile,
      req.user.id,
      coverFile,
    );
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.bookService.remove(id);
      return { message: 'Book deleted successfully' };
    } catch (error) {
      if (error.message === 'Invalid book ID') {
        throw new BadRequestException('Invalid book ID');
      }
      throw new InternalServerErrorException('Error deleting book');
    }
  }

  @Get(':id/file')
  async getBookFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const file = await this.bookService.getBookFile(id);
    const stream = createReadStream(file.path);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}.pdf"`,
    });

    stream.pipe(res);

    stream.on('error', (error) => {
      console.error('Ошибка при чтении файла:', error);
      res.status(500).send('Ошибка при чтении файла');
    });
  }

  @Patch(':id/cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './uploads/covers',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async updateCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bookService.updateCover(+id, file.filename);
  }

  @Get(':id/cover')
  async getBookCover(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const file = await this.bookService.getBookCover(id);
    const stream = createReadStream(file.path);

    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename)}"`,
    });

    stream.pipe(res);

    stream.on('error', (error) => {
      console.error('Ошибка при чтении файла обложки:', error);
      res.status(500).send('Ошибка при чтении файла обложки');
    });
  }
}
