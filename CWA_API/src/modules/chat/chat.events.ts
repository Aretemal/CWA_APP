import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

import type { ChatMessage } from './types/chat.types';

@Injectable()
export class ChatEvents {
  private messageSubject = new Subject<{
    userId: number;
    message: ChatMessage;
  }>();

  messageEvent$ = this.messageSubject.asObservable();

  emitMessage(userId: number, message: ChatMessage) {
    this.messageSubject.next({ userId, message });
  }
}
