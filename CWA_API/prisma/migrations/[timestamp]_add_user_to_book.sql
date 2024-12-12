-- CreateTable
ALTER TABLE "Book" ADD COLUMN "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Обновляем существующие записи, присваивая им userId первого админа
UPDATE "Book" SET "userId" = (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1);

-- Делаем колонку обязательной после обновления данных
ALTER TABLE "Book" ALTER COLUMN "userId" SET NOT NULL; 