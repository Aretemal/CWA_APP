import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from './modules/prisma/prisma.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BookModule } from './modules/book/book.module';
import { GenreModule } from './modules/genre/genre.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { FolderModule } from './modules/folder/folder.module';
import { TranslateModule } from './modules/translate/translate.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    ChatModule,
    AuthModule,
    UserModule,
    BookModule,
    GenreModule,
    BookmarkModule,
    NotificationModule,
    SubscriptionModule,
    FolderModule,
    TranslateModule,
  ],
})
export class AppModule {}
