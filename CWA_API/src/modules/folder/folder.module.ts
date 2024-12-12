import { Module } from '@nestjs/common';

import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}
