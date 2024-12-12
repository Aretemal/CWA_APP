-- CreateEnum
CREATE TYPE "BookshelfType" AS ENUM ('PLAN_TO_READ', 'READING', 'COMPLETED', 'DROPPED', 'FAVORITE');

-- CreateTable
CREATE TABLE "Bookshelf" (
    "id" SERIAL NOT NULL,
    "type" "BookshelfType" NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookshelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookToBookshelf" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BookToBookshelf_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookshelf_userId_type_key" ON "Bookshelf"("userId", "type");

-- CreateIndex
CREATE INDEX "_BookToBookshelf_B_index" ON "_BookToBookshelf"("B");

-- AddForeignKey
ALTER TABLE "Bookshelf" ADD CONSTRAINT "Bookshelf_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookshelf" ADD CONSTRAINT "_BookToBookshelf_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookshelf" ADD CONSTRAINT "_BookToBookshelf_B_fkey" FOREIGN KEY ("B") REFERENCES "Bookshelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
