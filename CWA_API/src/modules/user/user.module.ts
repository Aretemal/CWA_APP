import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BookshelfModule } from '../bookshelf/bookshelf.module';
import { FolderModule } from '../folder/folder.module';

@Module({
  imports: [PrismaModule, BookshelfModule, FolderModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
