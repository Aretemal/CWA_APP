import { Book } from '@prisma/client';

export interface BookWithWeight extends Book {
  weight: number;
}
